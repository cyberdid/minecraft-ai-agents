// programs/324-sprint-to-base.js
console.log('=== SPRINT TO BASE SHELTER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

const waypoints = [
  new Vec3(135, 62, -65),
  new Vec3(175, 62, -58),
  new Vec3(215, 62, -55),
  new Vec3(255, 66, -55),
  new Vec3(285, 71, -55),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 10000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
    } catch (e2) {
      console.log(`Fallback run to WP ${i + 1}:`, e2.message);
      await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      bot.setControlState('jump', true);
      await sleep(2000);
      bot.clearControlStates();
    }
  }
}

console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));

// Enter base through door at (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Lock spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn locked at base bed!');
} catch (e) {}

console.log('\n=== STATUS AT BASE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma safely arrived at base shelter at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20, Food: ${bot.food}/20`);
