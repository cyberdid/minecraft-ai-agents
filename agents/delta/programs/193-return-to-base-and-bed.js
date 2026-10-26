// programs/193-return-to-base-and-bed.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time:', JSON.stringify(lib.time()));

// 1. Sprint/walk to base at (293, 72, -54)
bot.chat('delta: Running east from spawn (91, 62, -56) to Base Camp (293, 72, -54)...');
console.log('Heading to base...');
try {
  await lib.goTo(293, 72, -54, 2);
  console.log('Arrived near base! Pos:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('goTo base error:', err.message);
  // Fallback: try goToXZ
  try {
    await lib.goToXZ(293, -54);
  } catch (e) {
    console.log('goToXZ error:', e.message);
  }
}

// 2. Go through base door
const doorPos = new Vec3(294, 73, -54);
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Inside base at:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Door error:', err.message);
  await lib.goTo(293, 72, -54, 1);
}

// 3. Set spawn at bed immediately!
try {
  await lib.setSpawn();
  console.log('Respawn point set at base bed!');
  bot.chat('delta: Spawn point locked at Base bed (294, 72, -55)!');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 4. If night arrives, sleep in bed to skip night
const t = lib.time();
if (t.canSleep) {
  console.log('Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Night skipped!');
  } catch (err) {
    console.log('Sleep notice:', err.message);
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Status final:', JSON.stringify(lib.status()));
