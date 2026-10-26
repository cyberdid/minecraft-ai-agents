// programs/320-sprint-to-base-and-lock-spawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

bot.chat('delta: Sprinting 83m East to base shelter at (294, 72, -54)...');

const waypoints = [
  new Vec3(250, 65, -80),
  new Vec3(275, 70, -65),
  new Vec3(290, 72, -55),
  new Vec3(293, 72, -54)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.clearControlStates();
  }
}

console.log('Arrived outside base door! Pos:', lib.fmt(bot.entity.position));

// Enter base through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door attempt note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Lock spawn on bed
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 5 });
console.log('Beds found in base:', beds.map(p => lib.fmt(p)));
if (beds.length > 0) {
  const targetBed = beds[beds.length - 1]; // Pick Bed 2
  console.log('Setting spawn on bed at', lib.fmt(targetBed));
  try {
    const bedBlock = bot.blockAt(targetBed);
    await bot.activateBlock(bedBlock);
    bot.chat(`delta: Spawn locked at base bed (${lib.fmt(targetBed)})!`);
  } catch (err) {
    console.log('Bed activate error:', err.message);
  }
}
