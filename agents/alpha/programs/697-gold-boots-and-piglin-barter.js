// programs/697-gold-boots-and-piglin-barter.js
console.log('=== Program 697: Craft Golden Boots & Barter for Ender Pearls ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Gear check
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}

// 2. Warp into Nether
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal...');
  bot.chat('alpha: Entering Nether to complete golden_boots and barter for Ender Pearls (Milestone 9)!');
  await globalThis.enterNetherPortal();
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Raise shield for protection
  bot.activateItem(true);

  // Advance along safe trail to (63, 65, -20)
  const WAYPOINTS = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 }
  ];

  console.log('Following safe trail to East Ridge...');
  for (const wp of WAYPOINTS) {
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 2.5) continue;
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
    } catch (e) {
      try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
    }
  }

  // 3. Mine nether_gold_ore if under 4 ingots
  let totalGoldEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
  console.log(`Current gold equiv: ${totalGoldEquiv} nuggets (need 36 for boots)`);

  if (totalGoldEquiv < 36 && lib.count('golden_boots') === 0) {
    const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
    const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 32, count: 20 })
      .map(p => bot.blockAt(p))
      .filter(Boolean)
      .filter(b => b.position.y >= 55 && b.position.y <= 75);

    console.log(`Found ${ores.length} safe nether_gold_ore blocks along ridge.`);
    for (const ore of ores) {
      if (checkCancelled()) break;
      totalGoldEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
      if (totalGoldEquiv >= 36) break;

      console.log(`Mining nether_gold_ore at ${lib.fmt(ore.position)}...`);
      try {
        await lib.dig(ore.position.x, ore.position.y, ore.position.z);
        await lib.pickup(3.5);
      } catch (err) {}
    }
    try { await lib.pickup(4.0); } catch (e) {}
  }

  // Craft all available nuggets into ingots
  if (lib.count('gold_nugget') >= 9) {
    const craftable = Math.floor(lib.count('gold_nugget') / 9);
    try {
      await lib.craft('gold_ingot', craftable);
      console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
    } catch (e) {}
  }

  // 4. Craft and equip golden_boots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('golden_boots crafted!');
      const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
      if (boots) await bot.equip(boots, 'feet');
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglin neutrality is 100% ACTIVE!');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  // Verify boots worn
  const bootsWorn = bot.inventory.slots[8]?.name === 'golden_boots';
  console.log('Boots worn (slot 8):', bot.inventory.slots[8]?.name, 'Neutrality active:', bootsWorn);

  // 5. If wearing gold armor, barter gold ingots with neutral Piglins!
  if (bootsWorn && lib.count('gold_ingot') > 0) {
    console.log(`Starting Piglin bartering with ${lib.count('gold_ingot')} gold ingots...`);
    const piglins = Object.values(bot.entities)
      .filter(e => e.name === 'piglin' && e.isValid)
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    console.log(`Found ${piglins.length} Piglins nearby.`);
    const piglin = piglins[0];

    if (piglin && bot.entity.position.distanceTo(piglin.position) < 16) {
      console.log(`Approaching neutral Piglin at ${lib.fmt(piglin.position)}...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.0));
      } catch (e) {}

      // Toss gold ingot to Piglin
      const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (ingot) {
        console.log('Tossing gold ingot to Piglin...');
        await bot.lookAt(piglin.position.offset(0, 1, 0), true);
        try {
          await bot.toss(ingot.type, null, 1);
          bot.chat('alpha: Tossed gold ingot to neutral Piglin for bartering!');
          console.log('Waiting 6 seconds for barter drop...');
          await sleep(6500);
          await lib.pickup(5);
        } catch (e) {
          console.log('Barter toss error:', e.message);
        }
      }
    }
  }

  // 6. Check for nearby Endermen to hunt for Ender Pearls
  const endermen = Object.values(bot.entities)
    .filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12);

  if (endermen.length > 0) {
    const em = endermen[0];
    console.log(`Enderman spotted at ${lib.fmt(em.position)} (${bot.entity.position.distanceTo(em.position).toFixed(1)}m)!`);
    // Safe low-gaze melee attack (strike feet)
    try {
      await lib.equipWeapon();
      await bot.lookAt(em.position.offset(0, 0.5, 0), true);
      bot.attack(em);
      await sleep(600);
      bot.attack(em);
      await lib.pickup(4);
    } catch (e) {}
  }

  bot.deactivateItem();
  const pearls = lib.count('ender_pearl');
  console.log(`Milestone 9 progress: Alpha holds ${pearls}/12 Ender Pearls.`);
  bot.chat(`alpha: Barter & hunting round complete. Ender Pearls held: ${pearls}/12, Gold ingots: ${lib.count('gold_ingot')}`);
}

console.log('=== Program 697 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Boots:', bot.inventory.slots[8]?.name, 'Inv:', lib.inv());
