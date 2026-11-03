// programs/371-sleep-in-base-to-dawn.js
console.log('=== DUSK ARRIVED: ENTER BASE & SLEEP WITH SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Gear:', JSON.stringify(lib.tools()));

// 1. Enter base immediately
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 12000 });
} catch (e) {
  console.log('goTo note:', e.message);
}

try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

bot.chat('gamma: shield equipped! Sleeping in bed to skip night');

// 2. Sleep in bed
const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
for (let wait = 0; wait < 60; wait++) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`Night sleep trigger at ${t.timeOfDay}...`);
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

// 3. Confirm dawn
for (let wait = 0; wait < 20; wait++) {
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.timeOfDay >= 23460) {
    console.log('Dawn verified! Time:', t.timeOfDay);
    break;
  }
  await sleep(2000);
}

// Ensure shield & weapon equipped
await lib.equipArmor();
await lib.equipWeapon();

console.log('Morning status:', JSON.stringify(lib.status()));
