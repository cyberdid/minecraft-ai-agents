// programs/221-enter-base-and-sleep.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time start:', JSON.stringify(lib.time()));

bot.pathfinder.stop();
await sleep(300);

// 1. Walk directly to door at (294, 73, -54)
console.log('Walking to base door (294, 73, -54)...');
bot.chat('delta: Walking into base shelter to sleep at dusk with Alpha...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 73, -54, 1));
} catch (e) {
  console.log('GoalNear notice:', e.message);
}

// 2. Go through door into base
const doorPos = new Vec3(294, 73, -54);
console.log('Entering through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Entered base through door!');
} catch (err) {
  console.log('goThroughDoor error:', err.message);
  await lib.goTo(293, 72, -55, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Lock bed spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {}

// 4. Wait for sleep time (tick >= 12542) and sleep in bed
console.log('Waiting for sleep time (tick >= 12542)...');
for (let i = 0; i < 40; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed! Night skipped.');
      bot.chat('delta: Slept in base bed with team, morning arrived!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
    break;
  }
  await sleep(1000);
}

await sleep(2000);
console.log('Final time info:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final status:', JSON.stringify(lib.status()));
