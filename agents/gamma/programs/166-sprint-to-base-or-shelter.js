// programs/166-sprint-to-base-or-shelter.js
console.log('--- RETURN TO BASE BEFORE NIGHTFALL ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

const target = new Vec3(294, 72, -53);
console.log(`Distance to base: ${bot.entity.position.distanceTo(target).toFixed(1)}m`);

try {
  // Sprint towards base
  await lib.goTo(294, 72, -53, 2, { timeoutMs: 35000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 25000 });
  } catch (e2) {
    console.log('goToXZ note:', e2.message);
  }
}

console.log('Pos now:', lib.fmt(bot.entity.position));
const distNow = bot.entity.position.distanceTo(target);
console.log('Distance to base now:', distNow.toFixed(1));

if (distNow <= 6) {
  console.log('Near base door! Entering base...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Safely inside base!');
  } catch (e) {
    console.log('goThroughDoor note:', e.message);
    await lib.goTo(293, 72, -56, 1);
  }
  
  // Close door
  try { await lib.door(294, 72, -54, false); } catch (e) {}

  // Wait for 12542 to sleep
  console.log('Waiting to sleep at 12542 with team...');
  bot.chat('Gamma is at base! Ready to sleep at 12542.');
  while (bot.time.timeOfDay < 12542 && !isCancelled()) {
    await sleep(500);
  }
  try {
    await lib.sleepInBed();
    console.log('SLEPT IN BED!');
    bot.chat('Gamma slept in bed! Night skipped.');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
} else {
  console.log('Too far from base! Checking night safety...');
  if (lib.time().secondsUntilNight < 45 || lib.time().night) {
    console.log('Emergency shelter outdoors!');
    await lib.shelter();
    console.log('Sheltered safely underground! Pos:', lib.fmt(bot.entity.position));
    bot.chat(`Gamma sheltered safely at ${lib.fmt(bot.entity.position)} for the night.`);
  }
}

console.log('Final time:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position));
