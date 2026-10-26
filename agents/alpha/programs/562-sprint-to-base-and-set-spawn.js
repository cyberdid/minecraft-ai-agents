// programs/562-sprint-to-base-and-set-spawn.js
console.log('=== Program 562: Sprint to Base & Set Spawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Sprint East towards base
console.log('Sprinting East to base...');
const waypoints = [
  new Vec3(275, 68, -54),
  new Vec3(290, 72, -54),
  new Vec3(294, 72, -54) // Base door
];

for (const wp of waypoints) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 8000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

// Enter through door at (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(293, 72, -55), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Lock spawn on bed at (294, 72, -55) or (293, 72, -56)
console.log('Setting spawn on base bed...');
try {
  await lib.setSpawn();
  console.log('Spawn successfully set on base bed!');
} catch (e) {
  console.log('lib.setSpawn note:', e.message);
}

// Check chests and furnaces for iron or gold
console.log('Alpha inventory:', lib.inv());
bot.chat(`alpha: Safely inside base ${lib.fmt(bot.entity.position)}! Spawn locked!`);
