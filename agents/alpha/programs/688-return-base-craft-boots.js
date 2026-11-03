// programs/688-return-base-craft-boots.js
console.log('=== Program 688: Return to Base & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// If in Nether with low HP, take rapid safe reset to Overworld base bed
if (bot.game.dimension === 'the_nether') {
  console.log('In Nether with low HP. Respawning at Base Bed (294, 72, -55)...');
  // Walk to nearby ledge or soul fire to trigger instant base bed respawn
  const fire = bot.findBlock({ matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'), maxDistance: 16 });
  if (fire) {
    await bot.lookAt(fire.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);
  } else {
    // Jump down from current ledge
    bot.setControlState('jump', true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(1000);
}

// In Overworld
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld Base! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  
  // Step into base house
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 3.0) {
    try { await lib.goTo(294, 72, -52, 2, { timeoutMs: 8000 }); } catch (e) {}
  }
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const ing = chest.containerItems().find(i => i.name === 'gold_ingot');
      const nug = chest.containerItems().find(i => i.name === 'gold_nugget');
      const boots = chest.containerItems().find(i => i.name === 'golden_boots');
      if (boots) await chest.withdraw(boots.type, null, 1);
      if (ing) await chest.withdraw(ing.type, null, ing.count);
      if (nug) await chest.withdraw(nug.type, null, nug.count);
      await chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  console.log('Gold in inventory: ingots =', lib.count('gold_ingot'), 'nuggets =', lib.count('gold_nugget'));

  // Craft ingots from nuggets
  if (lib.count('gold_nugget') >= 9) {
    const craftable = Math.floor(lib.count('gold_nugget') / 9);
    console.log(`Crafting ${craftable} gold ingots...`);
    try {
      await lib.craft('gold_ingot', craftable);
      console.log('Total ingots now:', lib.count('gold_ingot'));
    } catch (e) {
      console.log('Craft ingot note:', e.message);
    }
  }

  // Craft golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('Crafted golden_boots!');
      await lib.equipArmor();
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% neutral! Ready for Ender Pearl bartering!');
    } catch (e) {
      console.log('Craft boots note:', e.message);
    }
  }

  console.log('Armor worn:', bot.inventory.slots.slice(5, 9).map(s => s?.name));
}

console.log('=== Program 688 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
