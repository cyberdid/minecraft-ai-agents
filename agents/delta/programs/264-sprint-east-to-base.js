// programs/264-sprint-east-to-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

bot.chat('delta: Sprinting East across Overworld to base shelter at (294, 72, -54)...');

const waypoints = [
  new Vec3(130, 64, -25),
  new Vec3(180, 64, -35),
  new Vec3(230, 64, -45),
  new Vec3(270, 68, -50),
  new Vec3(292, 72, -54)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// Step inside base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door attempt note:', e.message);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
  await lib.goThroughDoor(294, 72, -54);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Find all beds in base
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 5 });
console.log('Beds found in base:', beds.map(p => lib.fmt(p)));

// Set spawn on second bed if available, or first bed
if (beds.length > 1) {
  console.log('Setting spawn on bed 2 at', lib.fmt(beds[1]));
  const bedBlock = bot.blockAt(beds[1]);
  await bot.activateBlock(bedBlock);
  bot.chat(`delta: Spawn locked at base bed 2 (${lib.fmt(beds[1])})!`);
} else if (beds.length === 1) {
  console.log('Setting spawn on bed at', lib.fmt(beds[0]));
  const bedBlock = bot.blockAt(beds[0]);
  await bot.activateBlock(bedBlock);
  bot.chat(`delta: Spawn locked at base bed (${lib.fmt(beds[0])})!`);
}
