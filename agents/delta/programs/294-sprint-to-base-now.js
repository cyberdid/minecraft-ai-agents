// programs/294-sprint-to-base-now.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

bot.chat('delta: Sprinting final 86m to base shelter at (294, 72, -54)...');

const waypoints = [
  new Vec3(230, 64, -42),
  new Vec3(255, 66, -46),
  new Vec3(275, 70, -50),
  new Vec3(290, 72, -52),
  new Vec3(293, 72, -53)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    // Direct sprint fallback
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
  } catch (e2) {
    console.log('Second door attempt note:', e2.message);
  }
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
    bot.chat(`delta: Spawn permanently locked at base bed (${lib.fmt(targetBed)})!`);
  } catch (err) {
    console.log('Bed activate error:', err.message);
  }
}
