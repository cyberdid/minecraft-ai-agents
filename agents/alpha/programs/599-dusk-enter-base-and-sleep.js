// programs/599-dusk-enter-base-and-sleep.js
console.log('=== Program 599: Dusk Protocol - Enter Base & Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Sprint directly to base door (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log(`Sprinting from ${lib.fmt(bot.entity.position)} to base door at ${lib.fmt(doorPos)}...`);

for (let attempt = 0; attempt < 3; attempt++) {
  if (bot.entity.position.distanceTo(doorPos) < 2.0) break;
  try {
    await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 1.5, { timeoutMs: 6000 });
  } catch (e) {
    console.log(`goTo attempt ${attempt + 1} note: ${e.message}`);
    await bot.lookAt(new Vec3(doorPos.x + 0.5, doorPos.y + 1.0, doorPos.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

console.log('At base door! Pos:', lib.fmt(bot.entity.position));

// 2. Go through door into base
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
    console.log('Door manual passage note:', e2.message);
  }
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));

// 3. Set spawn point at base bed
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('Spawn set successfully!');
  bot.chat('alpha: Inside base shelter! Spawn point locked at bed.');
} catch (se) {
  console.log('setSpawn note:', se.message);
}

// 4. Sleep in bed to skip night
console.log('Awaiting sleep window (TIME >= 12542)...');
const sleepStart = Date.now();
while (Date.now() - sleepStart < 50000 && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log('canSleep is true! Sleeping in bed...');
    bot.chat('alpha: Sleeping in base bed to skip night!');
    try {
      await lib.sleepInBed();
      console.log('Sleep finished!');
      break;
    } catch (sle) {
      console.log('sleepInBed note:', sle.message);
    }
  }
  await sleep(1000);
}

console.log('Final position:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', lib.time());
bot.chat(`alpha: Night protocol complete. Pos: ${lib.fmt(bot.entity.position)}, Time: ${lib.time().phase}`);
