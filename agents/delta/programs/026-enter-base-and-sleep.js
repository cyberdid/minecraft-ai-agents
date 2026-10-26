// programs/026-enter-base-and-sleep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

const doorPos = new Vec3(294, 72, -54);

// Walk to door
await bot.pathfinder.goto(new goals.GoalNear(doorPos.x, doorPos.y, doorPos.z, 2));

// Open door if closed
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}

// Walk inside to (294, 72, -56)
console.log('Walking inside...');
await lib.walkTo(294, -56);

// Close door
if (door && bot.blockAt(doorPos).getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));
console.log('Door closed:', !bot.blockAt(doorPos).getProperties().open);

bot.chat('delta: Inside base for the evening. Ready to sleep in Bed 2!');

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// Wait until canSleep (12542) or night
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

console.log('Time at sleep window:', JSON.stringify(lib.time()));

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

console.log('Time end:', JSON.stringify(lib.time()));
bot.chat('delta: Night protocol complete. Ready for day actions!');
