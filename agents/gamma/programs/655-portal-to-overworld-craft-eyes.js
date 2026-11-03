// programs/655-portal-to-overworld-craft-eyes.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 655: PORTAL TO OVERWORLD & CRAFT EYES OF ENDER ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Blaze Rods:', lib.count('blaze_rod'));

// 1. Maintain golden boots and shield
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Step into Nether Portal
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  console.log('Moving from East Ridge to Nether Portal Camp (46, 66, 2)...');
  bot.chat('gamma: Returning through Nether portal with 11 Blaze Rods!');

  try {
    await lib.goTo(46, 65, -7, 2, { timeoutMs: 15000 });
  } catch (e) {}

  let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    console.log(`Stepping into nether_portal at ${lib.fmt(portalBlock.position)}...`);
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
    bot.setControlState('forward', false);

    console.log('Waiting for warp to Overworld...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('Portal block not found within 16m, heading to (46.5, 66.0, 2.0)...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46.5, 66.0, 2.0, 1.0));
      const pb2 = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
      if (pb2) {
        await bot.lookAt(pb2.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(2500);
        bot.setControlState('forward', false);
      }
    } catch (e2) {}
  }
}

// 3. Arrived in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Arrived in OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Arrived in Overworld Base! Crafting 22 Blaze Powder from 11 Blaze Rods!');

  // Craft blaze_powder from blaze_rods (2x2 player inventory grid)
  const rods = lib.count('blaze_rod');
  if (rods > 0) {
    console.log(`Crafting blaze_powder from ${rods} blaze_rods...`);
    try {
      await lib.craft('blaze_powder', rods * 2);
      console.log(`SUCCESS! Blaze Powder crafted: ${lib.count('blaze_powder')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('blaze_powder')} BLAZE POWDER! Milestone 8 100% verified!`);
    } catch (err) {
      console.log('lib.craft blaze_powder error:', err.message);
    }
  }

  // Walk into Base House (293, 72, -55)
  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Sleep if night
  const timeOfDay = bot.time.timeOfDay;
  if (timeOfDay >= 12542 && timeOfDay <= 23460) {
    console.log('Night active, sleeping in bed...');
    const beds = bot.findBlocks({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
    for (const bp of beds) {
      try {
        await bot.sleep(bot.blockAt(bp));
        await sleep(5000);
        break;
      } catch (se) {}
    }
  }

  // Access Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest to deposit Blaze Powder and check for Ender Pearls...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      // Check if food to eat
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check for iron boots
      const ib = cItems.find(i => i.name === 'iron_boots');
      if (ib && lib.count('iron_boots') === 0) {
        await chest.withdraw(ib.type, null, 1);
      }

      // Deposit Blaze Powder if we have it, or withdraw Ender Pearls if inside
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        console.log(`Withdrawing ${epInChest.count} ender_pearls from chest...`);
        await chest.withdraw(epInChest.type, null, epInChest.count);
      } else {
        // Deposit 16 blaze_powder into chest so Beta/Delta can craft freely
        const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
        if (bpInInv && bpInInv.count >= 8) {
          console.log(`Depositing 16 blaze_powder into Base Chest for team...`);
          await chest.deposit(bpInInv.type, null, 16);
        }
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat food if hungry
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'];
  for (const f of foods) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft eye_of_ender if we hold both
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    console.log(`Crafting ${toCraft} eye_of_ender...`);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Stronghold expedition ready!`);
    } catch (err) {
      console.log('Craft eye_of_ender error:', err.message);
    }
  }

  // Equip iron armor & weapons
  const ironBoots = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ironBoots) try { await bot.equip(ironBoots, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

console.log(`=== END PROGRAM 655: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food} ===`);
console.log(`Resources: Blaze Rods=${lib.count('blaze_rod')}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}`);
bot.chat(`gamma: Status — Dim: ${bot.game.dimension}, Blaze Powder: ${lib.count('blaze_powder')}, Eyes: ${lib.count('eye_of_ender')}, HP: ${bot.health}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  blaze_rods: lib.count('blaze_rod'),
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  inv: lib.inv()
};
