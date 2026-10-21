// programs/031-sleep-night-3-with-beta.js
// Smelt raw iron, sleep in bed with beta at tick 12542 to skip Night 3!

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

// 1. Put raw iron and fuel into furnace at (295, 72, -55)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    // Take any output
    if (furnace.outputItem()) {
      await furnace.takeOutput();
      console.log('Retrieved output from furnace');
    }
    // Put remaining raw iron
    if (lib.count('raw_iron') > 0) {
      await furnace.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      console.log('Put raw iron into furnace input');
    }
    // Ensure fuel
    if (!furnace.fuelItem() && lib.count('*_log') > 0) {
      await furnace.putFuel(mcData.itemsByName.oak_log.id, null, 1);
      console.log('Added 1 oak_log as fuel');
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace setup note:', e.message);
  }
}

// 2. Wait until tick 12542
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`canSleep true at ${t.timeOfDay}! Sleeping in bed...`);
    break;
  }
  await sleep(1500);
}

// 3. Sleep in bed
bot.chat('alpha: In bed now with beta! Skipping night.');
try {
  await lib.sleepInBed();
  console.log('In bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// 4. Wait for daybreak
for (let i = 0; i < 20; i++) {
  await sleep(1000);
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Daybreak reached! Day 4! timeOfDay: ${t.timeOfDay}`);
    break;
  }
}

try {
  await bot.wake();
} catch (e) {}

const finalTime = lib.time();
console.log('Time after sleep:', finalTime);
bot.chat('alpha: Day 4 dawn! Morning arrived. Ready to finish iron gear.');

return {
  time: finalTime,
  ingots: lib.count('iron_ingot')
};
