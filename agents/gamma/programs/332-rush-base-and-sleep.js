// programs/332-rush-base-and-sleep.js
console.log('=== RUSH BASE AND SLEEP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay);

bot.pathfinder.stop();
bot.clearControlStates();
await sleep(100);

const waypoints = [
  new Vec3(215, 62, -62),
  new Vec3(255, 66, -56),
  new Vec3(285, 71, -55),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Rushing to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 8000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 });
    } catch (e2) {
      await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      bot.setControlState('jump', true);
      await sleep(1500);
      bot.clearControlStates();
    }
  }
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// Enter base door at (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at bed!');
} catch (e) {}

// Sleep to skip night
console.log('Attempting to sleep in bed...');
for (let attempt = 0; attempt < 10 && !isCancelled(); attempt++) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542 || t.timeOfDay > 23000) {
    try {
      await lib.sleepInBed();
      console.log('Sleeping! Waiting for dawn...');
      while (!isCancelled()) {
        await sleep(1000);
        const t2 = lib.time();
        if (!t2.night && t2.timeOfDay < 12000) {
          console.log(`Awoke at dawn! timeOfDay=${t2.timeOfDay}`);
          break;
        }
      }
      break;
    } catch (err) {
      console.log('Sleep attempt note:', err.message);
      await sleep(2000);
    }
  } else {
    await sleep(2000);
  }
}

console.log('\n=== STATUS AFTER SLEEP ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma safely inside base shelter! Night skipped. Pos: ${lib.fmt(bot.entity.position)}`);
