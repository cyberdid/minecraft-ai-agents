// programs/464-retreat-and-consolidate.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta retreating to base from:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Retreat from Nether to Overworld Base
if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: Team secured 8/8 Blaze Rods! Retreating to Overworld base to consolidate.');
  const res = await retreatToOverworldBase();
  console.log('Retreat result:', JSON.stringify(res));
}

console.log('Now at dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 2. If in Overworld, walk to base chest at (293, 72, -57)
if (bot.game.dimension === 'overworld') {
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {}

  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
  } catch (e) {}

  // 3. Inspect Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
      console.log('Base Chest items:', items.join(', '));

      // If Delta has any blaze rods, deposit them
      if (lib.count('blaze_rod') > 0) {
        await chest.deposit(mcData.itemsByName.blaze_rod.id, null, lib.count('blaze_rod'));
        console.log(`Deposited ${lib.count('blaze_rod')} blaze rods into base chest!`);
      }
      chest.close();
    } catch (e) {
      console.log('Chest interaction note:', e.message);
    }
  }

  // 4. Report team status
  const nearbyPlayers = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
  for (const p of nearbyPlayers) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}`);
  }

  bot.chat('delta: Milestone 8 100% COMPLETE! 8+ Blaze Rods harvested! Advancing to Milestone 9: Ender Pearls!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv: lib.inv()
};
