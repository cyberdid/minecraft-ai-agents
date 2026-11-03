// programs/445-march-and-slay.js
console.log('=== MARCH TO PILLBOX & SLAY BLAZES (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('gamma: In Nether! Fast marching via safe covered waypoints to join team at Spawner Pillbox (36, 66, -187)...');

// 1. Initial descent from portal deck (43, 75, -14) to WP 1 (46, 65, -7)
try {
  await lib.goTo(46, 65, -7, 2.0, { dig: false, timeoutMs: 12000 });
} catch (e) {
  console.log('Descent note:', e.message);
}

// 2. March all waypoints
console.log('Executing marchToSpawnerPillbox()...');
const marchResult = await marchToSpawnerPillbox();
console.log('March complete. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Verify proximity to pillbox
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.8, 66.0, -186.5));
console.log(`Distance to Pillbox station: ${distToPillbox.toFixed(1)}m`);

if (distToPillbox < 6.0) {
  bot.chat('gamma: Arrived at Spawner Pillbox! Slaying Blazes shoulder-to-shoulder with team!');
  // Slay Blazes for 150 seconds
  const farmResult = await farmBlazeRodsAtPillbox(8, 150000);
  console.log('Farm result:', farmResult);
} else {
  console.log('Could not reach Pillbox station within distance threshold.');
}

const finalRods = lib.count('blaze_rod');
bot.chat(`gamma: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
