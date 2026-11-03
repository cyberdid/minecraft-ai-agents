// programs/691-reset-to-base.js
console.log('=== Program 691: Reset to Base Bed & Rendezvous with Beta ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension === 'the_nether' && bot.health <= 1.0) {
  // Safe jump from block to trigger instant bed respawn
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  await sleep(1500);
}

console.log('Now at pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// In Overworld base
if (bot.game.dimension === 'overworld') {
  // Check if Beta is nearby
  const beta = bot.players.beta?.entity;
  if (beta) {
    console.log('Beta is here at:', lib.fmt(beta.position), 'holding:', beta.heldItem?.name);
    bot.chat('alpha: Reunited with Beta at Base! Ready for Milestone 9!');
  }

  // Open Base Chest and combine gold
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const ing = chest.containerItems().find(i => i.name === 'gold_ingot');
      const nug = chest.containerItems().find(i => i.name === 'gold_nugget');
      if (ing) await chest.withdraw(ing.type, null, ing.count);
      if (nug) await chest.withdraw(nug.type, null, nug.count);
      await chest.close();
    } catch (e) {}
  }

  console.log(`Gold on Alpha: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets`);
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log('Crafted ingots! Total now:', lib.count('gold_ingot'));
    } catch (e) {}
  }

  if (lib.count('gold_ingot') >= 4) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% neutral!');
    } catch (e) {}
  }
}

console.log('=== Program 691 Finished ===');
console.log('Status: Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
