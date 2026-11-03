// programs/699-alpha-boots-and-piglin-barter.js
console.log('=== Program 699: Alpha Craft Golden Boots & Piglin Barter ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Offhand shield verification
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// 2. Deposit junk into Base Chest to free inventory slots
if (bot.game.dimension === 'overworld') {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const junk = ['soul_sand', 'soul_soil', 'oak_sapling', 'wooden_pickaxe'];
      for (const name of junk) {
        const it = bot.inventory.items().find(i => i.name === name);
        if (it) {
          await chest.deposit(it.type, null, it.count);
          console.log(`Deposited ${name} x${it.count}`);
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest deposit error:', e.message);
    }
  }

  // Warp into Nether
  console.log('Entering Nether Portal...');
  bot.chat('alpha: Entering Nether to craft golden_boots and barter for Ender Pearls (Milestone 9)!');
  await globalThis.enterNetherPortal();
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  
  // Equip weapon
  try { await lib.equipWeapon(); } catch (e) {}
  
  // Step forward out of portal into bunker floor if still at portal
  if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 3.5) {
    await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }

  // 3. Clear any fire ahead
  if (typeof globalThis.clearFireAhead === 'function') {
    await globalThis.clearFireAhead();
  }

  // 4. Check if Alpha already has golden boots
  let hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
  let totalGoldNuggets = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
  console.log(`Initial Gold: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets (total equiv: ${totalGoldNuggets}). Boots worn: ${hasBoots}`);

  // 5. Mine nether_gold_ore until we have at least 36 nuggets (4 ingots) for boots + extra for bartering
  const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
  if (goldOreId && (totalGoldNuggets < 36 || !hasBoots)) {
    console.log('Scanning for safe nether_gold_ore blocks near bunker & ridge...');
    const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 20, count: 10 })
      .map(p => bot.blockAt(p))
      .filter(b => b && b.position.y >= 60 && b.position.y <= 75);

    console.log(`Found ${ores.length} safe gold ore blocks.`);
    for (const ore of ores) {
      if (checkCancelled()) break;
      totalGoldNuggets = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
      if (totalGoldNuggets >= 45 && hasBoots) break;

      console.log(`Moving near ore at ${lib.fmt(ore.position)}...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(ore.position.x, ore.position.y, ore.position.z, 2.5));
        const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        await lib.dig(ore.position.x, ore.position.y, ore.position.z);
        await sleep(200);
        await lib.pickup(3.5);
      } catch (err) {
        console.log(`Mining error at ${lib.fmt(ore.position)}:`, err.message);
      }
    }
  }

  // 6. Craft ingots from nuggets
  totalGoldNuggets = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
  console.log(`Gold after mining: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);

  if (lib.count('gold_nugget') >= 9) {
    const craftableIngots = Math.floor(lib.count('gold_nugget') / 9);
    console.log(`Crafting ${craftableIngots} gold ingots...`);
    try {
      await lib.craft('gold_ingot', craftableIngots);
      console.log(`Total gold_ingot now: ${lib.count('gold_ingot')}`);
    } catch (e) {
      console.log('Craft ingot error:', e.message);
    }
  }

  // 7. Craft and equip golden_boots
  hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
  if (!hasBoots && lib.count('gold_ingot') >= 4) {
    console.log('Crafting golden_boots...');
    try {
      // Move near the crafting table at (41, 65, -6)
      try {
        await bot.pathfinder.goto(new goals.GoalNear(41, 65, -6, 2.0));
      } catch (e) {}

      await lib.craft('golden_boots', 1);
      console.log('golden_boots crafted successfully!');
      const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
      if (gb) {
        await bot.equip(gb, 'feet');
        console.log('golden_boots EQUIPPED in slot 8!');
      }
      bot.chat('alpha: [SUIT UP] golden_boots equipped! 100% Piglin neutrality ACTIVE!');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
  console.log('Piglin neutrality status:', hasBoots ? 'ACTIVE (wearing golden_boots)' : 'INACTIVE');

  // 8. Piglin Bartering Loop
  let barterIngots = lib.count('gold_ingot');
  if (hasBoots && barterIngots > 0) {
    console.log(`Initiating Piglin bartering with ${barterIngots} gold ingots...`);
    const piglins = Object.values(bot.entities)
      .filter(e => e.name === 'piglin' && e.isValid)
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    console.log(`Found ${piglins.length} Piglins.`);
    if (piglins.length > 0) {
      const piglin = piglins[0];
      const dist = bot.entity.position.distanceTo(piglin.position);
      console.log(`Nearest Piglin at ${lib.fmt(piglin.position)} (${dist.toFixed(1)}m away).`);

      if (dist > 3.0 && dist < 16.0) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.0));
        } catch (e) {}
      }

      while (lib.count('gold_ingot') > 0 && !checkCancelled()) {
        const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
        if (!ingot) break;

        console.log(`Tossing gold_ingot to Piglin (${lib.count('gold_ingot')} remaining)...`);
        await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
        try {
          await bot.toss(ingot.type, null, 1);
          bot.chat('alpha: Tossed gold_ingot to neutral Piglin! Waiting for barter drop...');
          console.log('Waiting 6.5s for Piglin inspection & drop...');
          await sleep(6500);
          const gained = await lib.pickup(5);
          console.log(`Barter pickup gained items! Pearls now: ${lib.count('ender_pearl')}`);
        } catch (err) {
          console.log('Barter error:', err.message);
          break;
        }
      }
    } else {
      console.log('No Piglins within 16m; calling delta and beta.');
    }
  }

  // 9. Check for nearby Endermen to hunt
  const endermen = Object.values(bot.entities)
    .filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 14);

  if (endermen.length > 0) {
    const em = endermen[0];
    console.log(`Enderman spotted at ${lib.fmt(em.position)} (${bot.entity.position.distanceTo(em.position).toFixed(1)}m)!`);
    try {
      await lib.equipWeapon();
      // Low gaze to avoid angering if not already aggro
      await bot.lookAt(em.position.offset(0, 0.4, 0), true);
      bot.attack(em);
      await sleep(500);
      bot.attack(em);
      await sleep(500);
      bot.attack(em);
      await lib.pickup(4);
    } catch (e) {}
  }

  const finalPearls = lib.count('ender_pearl');
  console.log(`=== Milestone 9 Status: Alpha holds ${finalPearls}/12 Ender Pearls ===`);
  bot.chat(`alpha: Milestone 9 status: ${finalPearls}/12 Ender Pearls held. Golden Boots: ${hasBoots ? 'YES' : 'NO'}, Ingots: ${lib.count('gold_ingot')}`);
}

console.log('=== Program 699 Complete ===');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
