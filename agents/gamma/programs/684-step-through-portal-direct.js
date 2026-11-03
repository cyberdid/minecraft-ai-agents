// programs/684-step-through-portal-direct.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 684: DIRECT WAYPOINT TRANSIT INTO PORTAL ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

async function stepTo(target, distThresh = 0.5, maxMs = 3000) {
  console.log(`Stepping to target ${lib.fmt(target)}...`);
  const start = Date.now();
  bot.clearControlStates();
  while (bot.entity.position.distanceTo(target) > distThresh && Date.now() - start < maxMs && !isCancelled()) {
    await bot.lookAt(new Vec3(target.x, bot.entity.position.y + 1.2, target.z), true);
    bot.setControlState('forward', true);
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.clearControlStates();
  console.log(`Reached near target. Pos now: ${lib.fmt(bot.entity.position)}`);
}

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Moving directly along bunker lane into Nether portal (41, 65, -7)!');

  const waypoints = [
    new Vec3(46.5, 65.0, -6.5),
    new Vec3(45.5, 65.0, -7.5),
    new Vec3(43.5, 65.0, -7.5),
    new Vec3(41.5, 65.0, -7.0),
    new Vec3(41.0, 65.0, -7.0) // Nether Portal Block!
  ];

  for (const wp of waypoints) {
    if (isCancelled()) break;
    await stepTo(wp, 0.45, 3000);
  }

  bot.clearControlStates();
  console.log('In portal block! Block at feet:', bot.blockAt(bot.entity.position)?.name);
  console.log('Pos:', lib.fmt(bot.entity.position));
  console.log('Waiting for Nether warp countdown (4.0s motionless)...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const curBlock = bot.blockAt(bot.entity.position)?.name;
    if (curBlock !== 'nether_portal') {
      const nearPortal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 3 });
      if (nearPortal) {
        await bot.lookAt(nearPortal.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(200);
        bot.clearControlStates();
      }
    }
    await sleep(250);
  }
}

console.log('Dimension after warp check:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Warped to Overworld! Heading into Base House (293, 72, -55)!');
  await sleep(1000);
  bot.clearControlStates();

  const baseDoor = new Vec3(294, 72, -54);
  const baseInside = new Vec3(293.5, 72.0, -56.0);

  // Walk out of Overworld portal
  console.log('Walking out of Overworld portal to door (294, 72, -54)...');
  await stepTo(new Vec3(296.0, 72.0, -53.5), 0.6, 3000);
  await stepTo(new Vec3(294.0, 72.0, -53.5), 0.6, 3000);

  try {
    await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
  } catch (err) {
    console.log('goThroughDoor error:', err.message);
  }

  await stepTo(baseInside, 0.8, 2000);
  console.log('Inside Base House at:', lib.fmt(bot.entity.position));

  // Base Chest operations
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      console.log('Chest items:', cItems.map(i => `${i.name}x${i.count}`).join(', '));

      // Withdraw food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 8));
      }

      // Check iron armor
      for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots']) {
        const it = cItems.find(i => i.name === piece);
        if (it && lib.count(piece) === 0) {
          await chest.withdraw(it.type, null, 1);
        }
      }

      // Deposit 10 blaze_powder
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count > 12) {
        await chest.deposit(bpInInv.type, null, 10);
        bot.chat('gamma: Deposited 10 Blaze Powder in Base Chest for Beta/Alpha!');
      }

      // Withdraw any ender pearls in chest
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest err:', ce.message);
    }
  }

  // Eat
  for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender if pearls available
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    try {
      await lib.craft('eye_of_ender', toCraft);
      bot.chat(`gamma: Crafted ${toCraft} Eyes of Ender! Total in inv: ${lib.count('eye_of_ender')}`);
    } catch (e) {
      console.log('Craft eye_of_ender error:', e.message);
    }
  }

  // Equip full iron armor + weapon + shield
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) {
    try { await bot.equip(sh, 'off-hand'); } catch (e) {}
  }
}

console.log('=== END PROGRAM 684 ===');
console.log('Final Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
