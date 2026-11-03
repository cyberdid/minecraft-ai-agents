// programs/691-walk-x47-lane-into-portal1.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 691: WALK x=47 LANE INTO PORTAL 1 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Marching x=47 straight lane into Portal 1 (47, 66, 2)!');

  // Waypoints along x=47.2 to Portal 1
  const targets = [
    new Vec3(47.2, 65.0, -3.0),
    new Vec3(47.2, 65.5, -1.0),
    new Vec3(47.2, 66.0, 0.5),
    new Vec3(47.2, 66.0, 1.5),
    new Vec3(47.0, 66.0, 2.0) // Portal block!
  ];

  for (let i = 0; i < targets.length; i++) {
    if (isCancelled()) break;
    const tgt = targets[i];
    console.log(`Advancing to WP ${i + 1}/${targets.length}: ${lib.fmt(tgt)}...`);

    const startTgt = Date.now();
    bot.clearControlStates();
    bot.setControlState('forward', true);

    while (bot.entity.position.distanceTo(tgt) > 0.4 && Date.now() - startTgt < 3500 && !isCancelled()) {
      await bot.lookAt(new Vec3(tgt.x, bot.entity.position.y + 1.2, tgt.z), true);
      // Auto-jump to clear elevation changes
      if (bot.entity.isCollidedHorizontally || tgt.y > bot.entity.position.y + 0.2) {
        bot.setControlState('jump', true);
        await sleep(150);
        bot.setControlState('jump', false);
      }
      await sleep(50);
    }
    bot.clearControlStates();
    console.log(`WP ${i + 1} reached. Pos: ${lib.fmt(bot.entity.position)}`);
  }

  // Ensure bot is in portal block (47, 66, 2)
  const portalTarget = new Vec3(47.0, 66.0, 2.0);
  console.log(`Stepping directly into Portal 1 at ${lib.fmt(portalTarget)}...`);
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  let pStep = Date.now();
  while (bot.entity.position.distanceTo(portalTarget) > 0.35 && Date.now() - pStep < 2000 && !isCancelled()) {
    if (bot.entity.position.y < 65.9) {
      bot.setControlState('jump', true);
      await sleep(100);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.clearControlStates();

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Inside Portal 1! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);
  console.log('Standing motionless for Overworld warp (4.0s timer)...');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const curBlock = bot.blockAt(bot.entity.position)?.name;
    if (curBlock !== 'nether_portal') {
      const pBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 2.0 });
      if (pBlock) {
        await bot.lookAt(pBlock.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(200);
        bot.clearControlStates();
      }
    }
    await sleep(200);
  }
}

console.log('Dimension after portal warp check:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Overworld Base Operations
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Home in Overworld! Entering Base House (293, 72, -55) with 22 Blaze Powder!');
  console.log('Gamma in Overworld! Walking into Base House...');
  await sleep(1000);
  bot.clearControlStates();

  const baseDoor = new Vec3(294, 72, -54);
  const baseInside = new Vec3(293.5, 72.0, -56.0);

  // Step out of overworld portal frame (299.5, 73, -54)
  try {
    if (bot.entity.position.distanceTo(baseInside) > 2.5) {
      await lib.goToXZ(294, -53, { timeoutMs: 10000 });
      await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
    }
  } catch (e) {
    console.log('Door passage error:', e.message);
  }

  console.log('Inside base at:', lib.fmt(bot.entity.position));

  // Open Base Chest at (293, 72, -57)
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

      // Check if ender_pearls in chest
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        console.log(`Withdrawing ${epInChest.count} ender_pearls from chest...`);
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      // Deposit 10 blaze_powder into chest for teammates
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count >= 12) {
        console.log('Depositing 10 blaze_powder to chest for team...');
        await chest.deposit(bpInInv.type, null, 10);
        bot.chat('gamma: Deposited 10 Blaze Powder into Base Chest (293, 72, -57) for Beta/Alpha!');
      }

      chest.close();
    } catch (ce) {
      console.log('Chest err:', ce.message);
    }
  }

  // Eat food
  for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender if we have ingredients
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  console.log(`Crafting check: blaze_powder=${bp}, ender_pearl=${ep}`);
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    try {
      await lib.craft('eye_of_ender', toCraft);
      bot.chat(`gamma: CRAFTED ${toCraft} EYES OF ENDER! Total in inventory: ${lib.count('eye_of_ender')}`);
    } catch (err) {
      console.log('Craft error:', err.message);
    }
  }

  // Equip full iron armor + weapon + shield
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

console.log('=== END PROGRAM 691 ===');
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
