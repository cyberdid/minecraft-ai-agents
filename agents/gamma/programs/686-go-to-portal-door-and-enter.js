// programs/686-go-to-portal-door-and-enter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 686: NAVIGATE TO PORTAL APERTURE & ENTER ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Moving to portal threshold (41, 65, -6)...');
  globalThis.configureFireAvoidance();

  // Try pathfinder to threshold in front of portal
  const threshold = new Vec3(41.5, 65.0, -6.5);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(threshold.x, threshold.y, threshold.z, 0.5));
    console.log('Pathfinder reached threshold! Pos:', lib.fmt(bot.entity.position));
  } catch (err) {
    console.log('Pathfinder err, falling back to manual stepping:', err.message);
    // Manual stepping with auto-jump
    const start = Date.now();
    bot.clearControlStates();
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    while (bot.entity.position.distanceTo(threshold) > 0.6 && Date.now() - start < 6000 && !isCancelled()) {
      await bot.lookAt(new Vec3(threshold.x, bot.entity.position.y + 0.8, threshold.z), true);
      await sleep(100);
    }
    bot.clearControlStates();
    console.log('Manual stepping pos:', lib.fmt(bot.entity.position));
  }

  // Now step into the portal block at (41.0, 65.0, -7.0)
  const portalBlockPos = new Vec3(41.0, 65.0, -7.0);
  console.log('Stepping into portal block at:', lib.fmt(portalBlockPos));
  await bot.lookAt(portalBlockPos, true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Current block at feet:', bot.blockAt(bot.entity.position)?.name);
  console.log('Current pos in portal:', lib.fmt(bot.entity.position));
  console.log('Holding completely still for portal warp...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 20000 && !isCancelled()) {
    const cur = bot.blockAt(bot.entity.position)?.name;
    if (cur !== 'nether_portal') {
      const pBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 2.5 });
      if (pBlock) {
        await bot.lookAt(pBlock.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(250);
        bot.clearControlStates();
      }
    }
    await sleep(200);
  }
}

console.log('Dimension after Nether routine:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Successfully in Overworld! Walking into Base House (293, 72, -55)...');
  await sleep(500);
  bot.clearControlStates();

  // Walk out of portal frame towards base door
  const baseDoor = new Vec3(294, 72, -54);
  const baseInside = new Vec3(293.5, 72.0, -56.0);

  try {
    await lib.goToXZ(294, -53, { timeoutMs: 8000 });
    await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
  } catch (e) {
    console.log('Door passage error:', e.message);
  }

  // Chest access
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Accessing Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      console.log('Chest contains:', cItems.map(i => `${i.name}x${i.count}`).join(', '));

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
      if (bpInInv && bpInInv.count > 10) {
        await chest.deposit(bpInInv.type, null, 10);
        bot.chat('gamma: Deposited 10 Blaze Powder in Base Chest!');
      }

      // Withdraw ender pearls if available
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat
  for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    try {
      await lib.craft('eye_of_ender', toCraft);
      bot.chat(`gamma: Crafted ${toCraft} Eyes of Ender! Total in inv: ${lib.count('eye_of_ender')}`);
    } catch (e) {
      console.log('Craft error:', e.message);
    }
  }

  // Equip full iron gear
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

console.log('=== END PROGRAM 686 ===');
console.log('Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
