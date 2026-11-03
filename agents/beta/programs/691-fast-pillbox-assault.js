// programs/691-fast-pillbox-assault.js
console.log('=== Program 691: Fast Pillbox Assault ===');
console.log('Start Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat('Beta: Geared up and executing fast march to Spawner Pillbox!');

// 1. Transit to Nether and march to Pillbox
if (bot.game.dimension === 'overworld') {
  console.log('Warping through Nether Portal...');
  await enterNetherPortal(30000);
  console.log('Warp result: Dimension is now', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to warp to Nether');
}

console.log('Marching 16 safe covered waypoints to Pillbox...');
const marchRes = await marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// 2. Position cleanly inside the Pillbox behind x=36 breastwork
console.log('Positioning inside Pillbox at (37, 66, -186)...');
try {
  await lib.goTo(37, 66, -186, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {
  console.log('Positioning note:', e.message);
}

console.log('In Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Farm Blazes
bot.chat('Beta: In Pillbox! Fighting Blazes for Milestone 8 (Blaze Rods)...');
const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
console.log('Farm results:', JSON.stringify(farmRes));

const finalRods = lib.count('blaze_rod');
console.log('Final Blaze Rods:', finalRods);

if (finalRods >= 8) {
  bot.chat(`Beta: Milestone 8 secured! ${finalRods} Blaze Rods harvested! Retreating.`);
  await retreatToOverworldBase();
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  hp: bot.health,
  food: bot.food
};
