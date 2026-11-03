// programs/624-secure-door-and-sleep-to-dawn.js
console.log('=== Program 624: Secure Door & Sleep to Dawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Secure base door at (294, 72, -54)
try {
  const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
  console.log('Door status:', doorBlock?.name);
  await lib.door(294, 72, -54, false);
  console.log('Base door secured (closed)!');
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Set spawn at Bed 1 (294, 72, -55)
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 3. Await sleep time and sleep
console.log('Current time info:', lib.time());
bot.chat(`alpha: Inside base, door closed, spawn set! Awaiting night sleep with team. Night in ${lib.time().secondsUntilNight}s.`);

const startTime = Date.now();
while (!isCancelled() && Date.now() - startTime < 60000) {
  const t = lib.time();
  if (t.canSleep || t.night) {
    console.log('Night reached! Calling lib.sleepInBed()...');
    bot.chat('alpha: Sleeping in bed to skip night to dawn!');
    try {
      await lib.sleepInBed();
      console.log('Successfully slept in bed! Dawn arrived!');
      break;
    } catch (err) {
      console.log('Sleep attempt note:', err.message);
      // If sleepInBed errored because not all players in bed or monsters nearby, retry shortly
      await sleep(1500);
    }
  } else {
    console.log(`Waiting for dusk... ${t.secondsUntilNight}s until night`);
    await sleep(2000);
  }
}

console.log('Final time info:', lib.time());
console.log('Alpha status:', lib.status());
bot.chat(`alpha: Day phase: ${lib.time().phase}, HP: ${bot.health}, Food: ${bot.food}. Ready for dawn expedition!`);
