// programs/632-enter-base-and-sleep.js
console.log('=== Program 632: Enter Base Shelter & Sleep to Skip Night ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Sprint to base door at (294, 72, -54)
console.log('Sprinting to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1)); } catch (e2) {}
}

// 2. Go through base door
console.log('Entering base shelter through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 3. Set spawn at Bed 2 (293, 72, -56)
try {
  await lib.setSpawn();
  console.log('Spawn set at Bed 2!');
} catch (e) {}

// 4. Wait for sleep time (>= 12542)
console.log('Current time:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 6000) {
  await sleep(100);
}

// 5. Sleep in bed
console.log('Sleeping in bed...');
try {
  await lib.sleepInBed();
  console.log('Sleeping via lib.sleepInBed()!');
} catch (e) {
  console.log('sleepInBed note:', e.message);
  const bedBlock = bot.blockAt(new Vec3(293, 72, -56));
  if (bedBlock) {
    try {
      await bot.activateBlock(bedBlock);
      console.log('Activated Bed 2 at (293, 72, -56)!');
    } catch (e2) {}
  }
}

// 6. Wait for dawn (night skip)
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay > 23000) {
    console.log('DAWN REACHED! Morning time:', bot.time.timeOfDay);
    break;
  }
}

return {
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  inv: lib.inv(),
  health: bot.health,
  food: bot.food
};
