// programs/694-step-straight-north-into-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 694: STEP STRAIGHT NORTH INTO PORTAL 1 ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Walking 3 meters straight north into Portal 1 (46, 66, 2)!');

  // Step 1: Walk to (46.0, 64.0, 3.5)
  console.log('Step 1: Walking to (46.0, 64.0, 3.5)...');
  await bot.lookAt(new Vec3(46.0, 65.0, 3.5), true);
  bot.setControlState('forward', true);
  let s1 = Date.now();
  while (bot.entity.position.z > 3.6 && Date.now() - s1 < 2500 && !isCancelled()) {
    await sleep(50);
  }
  bot.clearControlStates();
  console.log('Pos after step 1:', lib.fmt(bot.entity.position));

  // Step 2: Walk to (46.0, 65.0, 2.5) with jump to step onto obsidian sill
  console.log('Step 2: Stepping onto portal approach (46.0, 65.0, 2.5)...');
  await bot.lookAt(new Vec3(46.0, 66.0, 2.2), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  let s2 = Date.now();
  while (bot.entity.position.z > 2.6 && Date.now() - s2 < 2000 && !isCancelled()) {
    await sleep(50);
  }
  bot.setControlState('jump', false);
  bot.clearControlStates();
  console.log('Pos after step 2:', lib.fmt(bot.entity.position));

  // Step 3: Step right into Portal block (46.0, 66.0, 2.0)
  const portalBlock = new Vec3(46.5, 66.0, 2.0);
  console.log('Step 3: Stepping into portal block at:', lib.fmt(portalBlock));
  await bot.lookAt(portalBlock, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 65.8) {
    bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
  }
  let s3 = Date.now();
  while (Math.abs(bot.entity.position.z - 2.0) > 0.4 && Date.now() - s3 < 2000 && !isCancelled()) {
    await sleep(50);
  }
  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Inside Portal 1! Pos:', lib.fmt(bot.entity.position), 'Block at feet:', bot.blockAt(bot.entity.position)?.name);
  console.log('Standing completely motionless for portal warp timer...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.blockAt(bot.entity.position)?.name;
    if (cur !== 'nether_portal') {
      const nearP = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 2.0 });
      if (nearP) {
        await bot.lookAt(nearP.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(200);
        bot.clearControlStates();
      }
    }
    await sleep(250);
  }
}

console.log('Dimension after Nether routine:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Home in Overworld Base! Welcoming team with 22 Blaze Powder!');
  console.log('=== OVERWORLD BASE SUCCESS ===');
  console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  console.log('Inventory:', lib.inv());

  await sleep(1000);
  bot.clearControlStates();

  const baseDoor = new Vec3(294, 72, -54);
  const baseInside = new Vec3(293.5, 72.0, -56.0);

  // If outside portal frame, walk into house
  if (bot.entity.position.distanceTo(baseInside) > 2.5) {
    try {
      await lib.goToXZ(294, -53, { timeoutMs: 8000 });
      await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
    } catch (e) {
      console.log('Door info:', e.message);
    }
  }

  // Equip full iron armor, sword, shield
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Accessing Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      console.log('Chest items:', cItems.map(i => `${i.name}x${i.count}`).join(', '));

      // Deposit 10 Blaze Powder so teammates have powder
      const bp = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bp && bp.count > 10) {
        console.log('Depositing 10 Blaze Powder into chest...');
        await chest.deposit(bp.type, null, 10);
        bot.chat('gamma: Deposited 10 Blaze Powder in Base Chest for Beta/Alpha!');
      }

      // Check for ender_pearls in chest
      const ep = cItems.find(i => i.name === 'ender_pearl');
      if (ep) {
        console.log(`Withdrawing ${ep.count} ender_pearls from chest...`);
        await chest.withdraw(ep.type, null, ep.count);
      }

      // Withdraw food if needed
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 8));
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat food if we have it
  for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender if we have ingredients
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  console.log(`Crafting check: blaze_powder=${bpCount}, ender_pearl=${epCount}`);
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      bot.chat(`gamma: CRAFTED ${toCraft} EYES OF ENDER! Total in inv: ${lib.count('eye_of_ender')}`);
    } catch (err) {
      console.log('Craft eye_of_ender err:', err.message);
    }
  }

  // Ensure shield is equipped in offhand
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

console.log('=== END PROGRAM 694 ===');
console.log('Final Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  eyes: lib.count('eye_of_ender'),
  blaze_powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
