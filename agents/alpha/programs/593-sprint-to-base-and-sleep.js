// programs/593-sprint-to-base-and-sleep.js
console.log('=== Program 593: Sprint to Base & Set Spawn / Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Sprint East to base door at (294, 72, -54)
const waypoints = [
  new Vec3(260, 65, -53),
  new Vec3(275, 68, -54),
  new Vec3(288, 71, -54),
  new Vec3(293, 72, -54)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 12000 });
  } catch (e) {
    console.log(`goTo to ${lib.fmt(wp)} failed (${e.message}), sprinting straight...`);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

console.log('Near base door! Pos:', lib.fmt(bot.entity.position));

// 2. Enter base through door at (294, 72, -54)
console.log('Entering base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(293.5, 72.0, -56.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('Door passage error:', e2.message);
  }
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Set spawn / sleep in bed
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('Spawn set successfully!');
  bot.chat('alpha: Spawn point locked at base bed!');
} catch (se) {
  console.log('setSpawn note:', se.message);
}

// 4. If night arrives, sleep in bed to skip night
const t = lib.time();
console.log('Current time:', t);
if (t.secondsUntilNight < 30 || t.phase === 'night' || t.canSleep) {
  console.log('Awaiting sleep window or sleeping in bed...');
  const sleepStart = Date.now();
  while (Date.now() - sleepStart < 45000 && !isCancelled()) {
    const curTime = lib.time();
    if (curTime.canSleep) {
      console.log('Can sleep now! Attempting sleepInBed...');
      try {
        bot.chat('alpha: Sleeping in base bed to skip night...');
        await lib.sleepInBed();
        console.log('Sleep completed!');
        break;
      } catch (sle) {
        console.log('sleepInBed note:', sle.message);
      }
    }
    await sleep(1000);
  }
}

console.log('Final position:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', lib.time());
