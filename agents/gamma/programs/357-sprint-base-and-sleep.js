// programs/357-sprint-base-and-sleep.js
console.log('=== RETURN TO BASE AND SLEEP WITH DELTA ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// Navigate to base with dig enabled to avoid pathfinder getting stuck on terrain/trees
try {
  await lib.goTo(315, 71, -10, 2, { dig: true, timeoutMs: 25000 });
} catch (e) {
  console.log('Step 1 note:', e.message);
}

try {
  await lib.goTo(294, 72, -53, 2, { dig: true, timeoutMs: 25000 });
} catch (e) {
  console.log('Step 2 note:', e.message);
}

// Enter door
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
    console.log('Manually entered base!');
  } catch (e2) {
    console.log('Door entry error:', e2.message);
  }
}

bot.chat('gamma: inside base with cooked food! Ready to sleep');

// Check chest & deposit 1 cooked porkchop for Delta
try {
  await lib.deposit({ cooked_porkchop: 1 }, 293, 72, -57);
  console.log('Deposited 1 cooked porkchop in chest for teammates!');
} catch (e) {
  console.log('Chest deposit note:', e.message);
}

// Sleep routine
const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
for (let wait = 0; wait < 60; wait++) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`Night arrived (${t.timeOfDay})! Sleeping...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping...');
      await sleep(6000);
      break;
    } catch (e) {
      if (bedBlock) {
        try {
          await bot.activateBlock(bedBlock);
          await sleep(6000);
          break;
        } catch (e2) {}
      }
    }
  }
  await sleep(1000);
}

// Confirm morning
for (let wait = 0; wait < 20; wait++) {
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.timeOfDay >= 23460) {
    console.log('Morning arrived! Time:', t.timeOfDay);
    break;
  }
  await sleep(2000);
}

console.log('Morning status:', JSON.stringify(lib.status()));
