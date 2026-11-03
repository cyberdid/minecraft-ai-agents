console.log('=== DELTA: FARM PILLBOX BLAZES WITH ACTIVE SHIELD ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Call battle-tested preloaded helper
const farmRes = await farmBlazeRodsAtPillbox(12, 45000);
console.log('farmBlazeRodsAtPillbox result:', JSON.stringify(farmRes));

// Check nearby blazes remaining
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0));
console.log(`Blazes remaining: ${blazes.length}`);

// Announce status
bot.chat(`delta: Pillbox combat complete! Harvested Blaze Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20. Team barter status?`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
