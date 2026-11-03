// programs/673-clean-tactical-reset-to-base.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 673: TACTICAL RESET TO OVERWORLD BASE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Blaze Powder:', lib.count('blaze_powder'));

bot.clearControlStates();

// If in the_nether, execute 12-block cobblestone pillar reset
if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Executing clean tactical fall reset from Nether to Overworld Base Bed (294, 72, -55) with 22 Blaze Powder!');

  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
  if (cobble) {
    await bot.equip(cobble, 'hand');
    console.log('Pillaring up 12 blocks for clean fall reset...');
    for (let i = 0; i < 12 && !isCancelled(); i++) {
      bot.setControlState('jump', true);
      await sleep(150);
      try {
        const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (below) await bot.placeBlock(below, new Vec3(0, 1, 0));
      } catch (e) {}
      bot.setControlState('jump', false);
      await sleep(100);
    }
    console.log('Pillared to height:', bot.entity.position.y.toFixed(1));

    // Step off pillar
    console.log('Stepping off pillar for fall damage...');
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);

    // Wait for respawn
    await sleep(2500);
  }
}

// Overworld Base Operations
console.log('Checking dimension and position after reset...');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: United in Overworld Base at 20/20 HP with 22 Blaze Powder! Accessing Base Chest (293, 72, -57)...');

  // Move inside base if outside
  try {
    await lib.goTo(293, 72, -55, 1.2, { timeoutMs: 8000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
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

  // Equip iron armor & weapons
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

console.log(`=== END PROGRAM 673: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
