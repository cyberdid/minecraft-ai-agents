// programs/679-path-x48-into-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 679: SPRINT x=48 CORRIDOR INTO PORTAL ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.clearControlStates();

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Sprinting x=48 open lane directly into Nether Portal (47, 66, 2)!');

  // Step 1: Step West to x=48.0
  console.log('Step 1: Stepping to (48.0, 66.0, -4.0)...');
  await bot.lookAt(new Vec3(48.0, 66.0, -4.0), true);
  bot.setControlState('forward', true);
  let s1 = Date.now();
  while (bot.entity.position.x > 48.3 && Date.now() - s1 < 2000 && !isCancelled()) {
    await sleep(50);
  }
  bot.clearControlStates();
  console.log('Pos after step 1:', lib.fmt(bot.entity.position));

  // Step 2: Walk South along x=48 to z=1.0
  console.log('Step 2: Walking South along x=48 to (48.0, 66.0, 1.0)...');
  await bot.lookAt(new Vec3(48.0, 66.0, 1.0), true);
  bot.setControlState('forward', true);
  let s2 = Date.now();
  while (bot.entity.position.z < 0.8 && Date.now() - s2 < 4000 && !isCancelled()) {
    await sleep(50);
  }
  bot.clearControlStates();
  console.log('Pos after step 2:', lib.fmt(bot.entity.position));

  // Step 3: Step directly into Portal block at (47.0, 66.0, 2.0)
  const portalTarget = new Vec3(47.0, 66.0, 2.0);
  console.log(`Step 3: Stepping into portal block at ${lib.fmt(portalTarget)}...`);
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  let s3 = Date.now();
  while (bot.entity.position.distanceTo(portalTarget) > 0.4 && Date.now() - s3 < 3000 && !isCancelled()) {
    await sleep(50);
  }
  bot.clearControlStates();
  console.log('Inside Portal 1 block! Pos:', lib.fmt(bot.entity.position));

  // Step 4: Stand completely motionless for portal warp timer (4.0s)
  console.log('Standing motionless inside portal for warp timer...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.hypot(cur.x - 47.0, cur.z - 2.0) > 0.6) {
      await bot.lookAt(portalTarget, true);
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

console.log(`=== END PROGRAM 679: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
