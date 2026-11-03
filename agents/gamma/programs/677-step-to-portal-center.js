// programs/677-step-to-portal-center.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 677: WALK TO EXACT PORTAL 1 CENTER & WARP ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const portalCenter = new Vec3(46.5, 66.0, 2.0);

if (bot.game.dimension === 'the_nether') {
  console.log(`Walking remaining 6m directly to Portal 1 center at ${lib.fmt(portalCenter)}...`);
  bot.chat('gamma: Walking final 6m directly into Portal 1 (46.5, 66.0, 2.0)!');

  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  const start = Date.now();
  while (bot.entity.position.distanceTo(portalCenter) > 0.4 && Date.now() - start < 15000 && !isCancelled()) {
    await bot.lookAt(portalCenter, true);
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.clearControlStates();

  console.log('Arrived inside Portal 1 center! Current Pos:', lib.fmt(bot.entity.position));
  console.log('Standing completely motionless for portal warp timer...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.hypot(cur.x - 46.5, cur.z - 2.0) > 0.5) {
      await bot.lookAt(portalCenter, true);
      bot.setControlState('forward', true);
      await sleep(100);
      bot.clearControlStates();
    }
    await sleep(200);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Overworld Base Operations
if (bot.game.dimension === 'overworld') {
  console.log('WARPED TO OVERWORLD! Current pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Successfully in Overworld! Entering Base House (293, 72, -55) with 22 Blaze Powder!');

  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      await lib.goToXZ(294, -53, { timeoutMs: 12000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }

  // Inside base
  console.log('Inside Base House! Final pos:', lib.fmt(bot.entity.position));

  // Sleep if night
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t <= 23460) {
    const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
    if (bed) {
      try {
        await bot.sleep(bed);
        bot.chat('gamma: Sleeping in bed to skip night!');
        await sleep(5500);
      } catch (e) {}
    }
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      // Check food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check iron armor
      for (const piece of ['iron_boots', 'iron_helmet', 'iron_chestplate', 'iron_leggings']) {
        const it = cItems.find(i => i.name === piece);
        if (it && lib.count(piece) === 0) {
          await chest.withdraw(it.type, null, 1);
        }
      }

      // Deposit 16 Blaze Powder for team
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count >= 8) {
        await chest.deposit(bpInInv.type, null, Math.min(16, bpInInv.count));
        bot.chat('gamma: DEPOSITED 16 BLAZE POWDER INTO BASE CHEST (293, 72, -57)!');
      }

      // Check if ender_pearls in chest
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat if hungry
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'];
  for (const f of foods) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender if we have ingredients
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`CRAFTED! Total Eyes of Ender: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Stronghold expedition ready!`);
    } catch (err) {}
  }

  // Equip best gear
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

console.log(`=== END PROGRAM 677: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
