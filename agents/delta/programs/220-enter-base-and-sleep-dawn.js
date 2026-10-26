// programs/220-enter-base-and-sleep-dawn.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time start:', JSON.stringify(lib.time()));

bot.pathfinder.stop();
await sleep(300);

// 1. Walk 23m back into base shelter
const doorPos = new Vec3(294, 73, -54);
console.log('Entering base shelter through door (294, 73, -54)...');
bot.chat('delta: Entering base shelter to sleep at dusk and skip night to dawn...');

try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2);
} catch (e) {
  console.log('goTo door notice:', e.message);
  await bot.lookAt(doorPos, true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(4000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
}

// 2. Go through door into base
const door = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
    console.log('Entered base through door!');
  } catch (err) {
    await lib.goTo(293, 72, -55, 1);
  }
} else {
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
for (let i = 0; i < 60; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
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
