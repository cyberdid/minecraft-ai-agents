// programs/684-blaze-hunt-expedition.js
console.log('=== Program 684: Blaze Hunt Expedition ===');
console.log('Start Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('Initial Inv:', JSON.stringify(lib.inv()));

bot.chat('Beta: Regearing and marching to Blaze Spawner Pillbox!');

// 1. Quick Regear
console.log('--- Step 1: Quick Regear ---');
const regearRes = await quickRegear({ cobble: 16 });
console.log('Regear completed:', JSON.stringify(regearRes));
console.log('Inv after regear:', JSON.stringify(lib.inv()));

// 2. March to Spawner Pillbox (handles Overworld portal warp + 16 safe waypoints)
console.log('--- Step 2: March to Spawner Pillbox ---');
const marchRes = await marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// 3. Farm Blaze Rods at Pillbox
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(new Vec3(36, 66, -187)) < 10) {
  console.log('--- Step 3: Farming Blazes at Pillbox ---');
  bot.chat('Beta: At Spawner Pillbox! Engaging Blazes...');
  const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm completed:', JSON.stringify(farmRes));

  if (lib.count('blaze_rod') >= 8) {
    bot.chat(`Beta: Objective achieved! ${lib.count('blaze_rod')} Blaze Rods secured! Retreating to Overworld Base.`);
    console.log('--- Step 4: Retreating to Overworld Base ---');
    await retreatToOverworldBase();
  }
} else {
  console.log('Did not reach Pillbox. Current Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
}

console.log('Expedition finished. Final Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Final Inv:', JSON.stringify(lib.inv()));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health,
  food: bot.food
};
