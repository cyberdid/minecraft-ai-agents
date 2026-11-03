// programs/683-enter-portal-and-warp-overworld.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 683: ENTER NETHER PORTAL AND RETURN TO BASE ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Inventory:', lib.inv());

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Walking into Nether portal (41, 65, -7) to return to base!');
  globalThis.configureFireAvoidance();

  const portalTarget = new Vec3(41.0, 65.0, -7.0);

  // Use pathfinder to reach right beside/inside portal
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 0.6));
  } catch (err) {
    console.log('Pathfinder near goal err:', err.message);
  }

  // Ensure bot steps right into the portal block
  console.log('Stepping directly into portal block (41.0, 65.0, -7.0)...');
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  const stepStart = Date.now();
  while (bot.entity.position.distanceTo(portalTarget) > 0.4 && Date.now() - stepStart < 2500 && !isCancelled()) {
    await sleep(50);
  }
  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Current block underfoot/in body:', bot.blockAt(bot.entity.position)?.name);
  console.log('Standing motionless inside portal for warp timer...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    // If somehow drift outside portal, step back in
    const curBlock = bot.blockAt(bot.entity.position)?.name;
    if (curBlock !== 'nether_portal') {
      const nearPortal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 3 });
      if (nearPortal) {
        await bot.lookAt(nearPortal.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(300);
        bot.clearControlStates();
      }
    }
    await sleep(250);
  }
}

console.log('Dimension after warp check:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Home in Overworld! Walking into Base House (293, 72, -55)...');
  console.log('Step into Base House...');

  // Step out of overworld portal
  await sleep(1000);
  bot.clearControlStates();

  const baseDoor = new Vec3(294, 72, -54);
  const baseInside = new Vec3(293.5, 72.0, -56.0);

  try {
    if (bot.entity.position.distanceTo(baseInside) > 2.5) {
      await lib.goToXZ(294, -53, { timeoutMs: 10000 });
      await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
    }
  } catch (e) {
    console.log('Door passage info:', e.message);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 1.0));
    } catch (e2) {}
  }

  console.log('Inside base house at:', lib.fmt(bot.entity.position));

  // Inspect Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Inspecting Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      console.log('Chest items:', cItems.map(i => `${i.name}x${i.count}`).join(', '));

      // Withdraw food if hungry
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        console.log(`Withdrawing ${food.name} x${Math.min(food.count, 8)}...`);
        await chest.withdraw(food.type, null, Math.min(food.count, 8));
      }

      // Check iron armor pieces
      for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots']) {
        const it = cItems.find(i => i.name === piece);
        if (it && lib.count(piece) === 0) {
          console.log(`Withdrawing ${piece}...`);
          await chest.withdraw(it.type, null, 1);
        }
      }

      // Withdraw ender pearls if in chest
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        console.log(`Withdrawing ${epInChest.count} ender_pearls from chest...`);
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      // Deposit 10 blaze_powder into chest so teammates also have powder
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count > 12) {
        console.log('Depositing 10 blaze_powder to chest for team...');
        await chest.deposit(bpInInv.type, null, 10);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat food
  for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      console.log(`Eating ${f}...`);
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender if we have pearls + powder
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  console.log(`Crafting check: blaze_powder=${bp}, ender_pearl=${ep}`);
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    try {
      await lib.craft('eye_of_ender', toCraft);
      bot.chat(`gamma: Crafted ${toCraft} Eyes of Ender! Total in inv: ${lib.count('eye_of_ender')}`);
    } catch (err) {
      console.log('Craft error:', err.message);
    }
  }

  // Equip full iron gear
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    try { await bot.equip(shield, 'off-hand'); } catch (e) {}
  }
}

console.log('=== END PROGRAM 683 ===');
console.log('Final Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('Final Inv:', lib.inv());
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
