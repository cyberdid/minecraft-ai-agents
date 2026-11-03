// programs/710-blaze-harvest-run.js
console.log('=== Program 710: Blaze Harvest Run ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Blaze Rods in inventory:', lib.count('blaze_rod'));

// 1. Quick regear
await quickRegear({ cobble: 16 });

// 2. March directly to Spawner Pillbox (handles Nether portal transit + 16 waypoints)
bot.chat(`Beta: Marching to Spawner Pillbox! Current Blaze Rods: ${lib.count('blaze_rod')}/8`);
const marchRes = await marchToSpawnerPillbox();
console.log('March complete:', JSON.stringify(marchRes));

// 3. Farm Blazes at Pillbox
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(new Vec3(36, 66, -187)) < 8) {
  bot.chat(`Beta: At Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods)!`);
  const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm complete:', JSON.stringify(farmRes));

  if (lib.count('blaze_rod') >= 8) {
    bot.chat(`Beta: Milestone 8 COMPLETED! ${lib.count('blaze_rod')} Blaze Rods secured! Retreating to Base.`);
    await retreatToOverworldBase();
  }
} else {
  console.log('Pillbox not reached. Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health
};
