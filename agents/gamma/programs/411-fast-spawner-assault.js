// programs/411-fast-spawner-assault.js
console.log('=== FAST SPAWNER ASSAULT WITH ROBUST AUTOLOAD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Regear
await globalThis.quickRegear({ cobble: 16 });
bot.chat('gamma: Armed with stone_sword & cobblestone. Marching to Blaze Spawner Pillbox (36, 66, -187)!');

// 2. March directly to Spawner Pillbox
console.log('Calling marchToSpawnerPillbox()...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// 3. Farm Blaze Rods if arrived at Spawner Pillbox
const pillbox = new Vec3(36, 66, -187);
const dist = bot.entity.position.distanceTo(pillbox);
console.log(`Distance to Pillbox: ${dist.toFixed(1)} blocks. Dim: ${bot.game.dimension}`);

if (bot.game.dimension === 'the_nether' && dist <= 12) {
  bot.chat('gamma: Reached Spawner Pillbox! Slaying Blazes through firing slit...');
  console.log('Starting farmBlazeRodsAtPillbox...');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 90000);
  console.log('Farm completed:', JSON.stringify(farmRes));

  const totalRods = lib.count('blaze_rod');
  bot.chat(`gamma: Farming round finished. Total Blaze Rods: ${totalRods}`);
  if (totalRods >= 8) {
    bot.chat('gamma: MILESTONE 8 ACHIEVED! 8+ Blaze Rods secured!');
    console.log('Harvest target achieved! Retreating to base...');
    await globalThis.retreatToOverworldBase();
  }
} else {
  console.log('Did not reach Pillbox. Holding position. Pos:', lib.fmt(bot.entity.position));
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod')
};
