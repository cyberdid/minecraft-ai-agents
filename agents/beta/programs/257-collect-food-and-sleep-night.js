// programs/257-collect-food-and-sleep-night.js
console.log('=== Step 15: Collect food from F2, load beef/chicken, sleep night ===');

// 1. Check Furnace 2
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name} from F2`);
    await f2.takeOutput();
  }
  // If F2 is done with porkchops, add chicken and beef
  if (!f2.inputItem()) {
    if (lib.count('chicken') > 0) {
      console.log(`Adding ${lib.count('chicken')} chicken to F2...`);
      await f2.putInput(mcData.itemsByName.chicken.id, null, lib.count('chicken'));
    } else if (lib.count('beef') > 0) {
      console.log(`Adding ${lib.count('beef')} beef to F2...`);
      await f2.putInput(mcData.itemsByName.beef.id, null, lib.count('beef'));
    }
  }
  f2.close();
}

// 2. Wait for sleep time (tick 12542)
console.log('Waiting for bedtime...');
const sleepDeadline = Date.now() + 60000;
while (Date.now() < sleepDeadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log(`It is bedtime! tick ${t.timeOfDay}`);
    try {
      console.log('Sleeping in bed...');
      await lib.sleepInBed();
      console.log('Bed sleep complete!');
    } catch (e) {
      console.log('Sleep error:', e.message);
    }
    break;
  }
  await sleep(1500);
}

// Check time after sleep attempt
console.log('Time now:', lib.time());

// Take any finished output from F2
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name} from F2`);
    await f2.takeOutput();
  }
  f2.close();
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Bedtime handled. Time: ${lib.time().phase}. Cooked food on beta: ${lib.count('cooked_*')}.`);
