// programs/406-return-to-base.js
console.log('=== Program 406: Fast Return to Base & Sleep ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

const tStart = lib.time();
console.log(`Time: ${tStart.timeOfDay} (${tStart.phase}), seconds until night: ${tStart.secondsUntilNight}`);

// Step 1: Navigate in two stages towards base door at (294, 72, -54)
console.log('Navigating towards base...');
try {
  await lib.goToXZ(340, -56);
  console.log('Waypoint 1 reached at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Waypoint 1 note:', e.message);
}

try {
  await lib.goToXZ(296, -54);
  console.log('Near base door at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Near door note:', e.message);
}

// Step 2: Go through base door (294, 72, -54)
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Entered base successfully! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goThroughDoor fallback:', e.message);
  try {
    await lib.goTo(294, 72, -55, 1);
  } catch (e2) {
    console.log('goTo inside base note:', e2.message);
  }
}

// Step 3: Check if night and sleep
const tNow = lib.time();
console.log(`Current time: ${tNow.timeOfDay} (${tNow.phase}), canSleep: ${tNow.canSleep}`);

if (tNow.canSleep) {
  bot.chat('team: Alpha is in bed at base, sleeping to skip night.');
  try {
    await lib.sleepInBed();
    console.log('Sleep completed! Morning time:', lib.time().timeOfDay);
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
} else if (tNow.secondsUntilNight < 30) {
  console.log('Waiting inside base for sleep time (12542)...');
  while (lib.time().timeOfDay < 12542 && !isCancelled()) {
    await sleep(1000);
  }
  if (!isCancelled()) {
    bot.chat('team: Alpha sleeping in bed to skip night.');
    try {
      await lib.sleepInBed();
      console.log('Morning reached:', lib.time().timeOfDay);
    } catch (e) {
      console.log('sleep error:', e.message);
    }
  }
}

// Step 4: Verify chest and supplies inside base
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest check note:', e.message);
}

console.log('Alpha end pos:', lib.fmt(bot.entity.position));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
