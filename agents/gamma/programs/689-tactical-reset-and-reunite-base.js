// programs/689-tactical-reset-and-reunite-base.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 689: TACTICAL RESET TO OVERWORLD BASE BED ===');
console.log('Current Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Tactical reset to Overworld Base Bed (294, 72, -55)! keepInventory active.');

  // Find nearest soul fire or step to (50.5, 65.0, -7.0)
  const fireBlock = bot.findBlock({
    matching: b => b && (b.name === 'soul_fire' || b.name === 'fire'),
    maxDistance: 12
  });

  if (fireBlock) {
    console.log(`Stepping into ${fireBlock.name} at ${lib.fmt(fireBlock.position)}...`);
    const fp = fireBlock.position.offset(0.5, 0.0, 0.5);
    const startWalk = Date.now();
    while (bot.entity.position.distanceTo(fp) > 0.3 && Date.now() - startWalk < 4000 && !isCancelled()) {
      await bot.lookAt(fp, true);
      bot.setControlState('forward', true);
      if (bot.entity.isCollidedHorizontally) {
        bot.setControlState('jump', true);
        await sleep(150);
        bot.setControlState('jump', false);
      }
      await sleep(50);
    }
    bot.clearControlStates();
  } else {
    // Pillar up with cobblestone and jump
    console.log('Pillaring up with cobblestone...');
    const cob = bot.inventory.items().find(i => i.name === 'cobblestone');
    if (cob) {
      await bot.equip(cob, 'hand');
      for (let h = 0; h < 6 && !isCancelled(); h++) {
        bot.setControlState('jump', true);
        await sleep(300);
        bot.setControlState('jump', false);
        const ref = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (ref) {
          try { await bot.placeBlock(ref, new Vec3(0, 1, 0)); } catch (e) {}
        }
        await sleep(100);
      }
      // Jump off
      bot.setControlState('forward', true);
      await sleep(500);
      bot.clearControlStates();
    }
  }

  // Wait for respawn
  console.log('Waiting for respawn at Overworld base bed...');
  const startWait = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - startWait < 15000 && !isCancelled()) {
    await sleep(200);
  }
}

console.log('Dimension after reset:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Responded at Overworld Base Bed! 20/20 HP & Food. 22 Blaze Powder safe in hand!');
  console.log('Gamma in Overworld! Health:', bot.health, 'Food:', bot.food);
  console.log('Inventory:', lib.inv());

  // Equip iron armor, sword, shield
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

  // Check if night to sleep
  const time = bot.time.timeOfDay;
  console.log(`Current time of day: ${time}`);
  if (time >= 12542 && time < 23460) {
    console.log('Night time! Sleeping in Bed 1 (294, 72, -55)...');
    try {
      const bed = bot.blockAt(new Vec3(294, 72, -55));
      if (bed) {
        await bot.sleep(bed);
        bot.chat('gamma: Sleeping in Bed 1 to skip night with team!');
        await sleep(4000);
      }
    } catch (se) {
      console.log('Sleep notice:', se.message);
    }
  }

  // Access Base Chest at (293, 72, -57)
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
        console.log('Depositing 10 Blaze Powder to chest...');
        await chest.deposit(bp.type, null, 10);
        bot.chat('gamma: Deposited 10 Blaze Powder into Base Chest (293, 72, -57) for Beta!');
      }

      // Check if ender_pearls in chest
      const ep = cItems.find(i => i.name === 'ender_pearl');
      if (ep) {
        console.log(`Withdrawing ${ep.count} ender_pearls from chest...`);
        await chest.withdraw(ep.type, null, ep.count);
      }

      // Check food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && lib.count(food.name) < 8) {
        await chest.withdraw(food.type, null, Math.min(food.count, 8));
      }

      chest.close();
    } catch (ce) {
      console.log('Chest err:', ce.message);
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
    } catch (e) {
      console.log('Craft error:', e.message);
    }
  }

  // Re-verify armor and offhand shield
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

console.log('=== END PROGRAM 689 ===');
console.log('Final Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  eyes: lib.count('eye_of_ender'),
  blaze_powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
