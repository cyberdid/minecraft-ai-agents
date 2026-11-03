// programs/624-wait-night-and-check-furnaces.js
console.log('=== Program 624: Check Furnaces & Wait for Dawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// 1. Walk right next to furnace array at (294.5, 72.0, -56.0)
try {
  await lib.goTo(294.5, 72.0, -56.0, 1, { timeoutMs: 4000 });
} catch (e) {
  console.log('Move error:', e.message);
}

// 2. Check furnace at (295, 72, -55)
const f1Pos = new Vec3(295, 72, -55);
const f1 = bot.blockAt(f1Pos);
if (f1 && f1.name.includes('furnace')) {
  try {
    await bot.lookAt(f1Pos.offset(0.5, 0.5, 0.5), true);
    const furnace = await bot.openFurnace(f1);
    console.log('Furnace 1 (295, 72, -55):');
    const out = furnace.outputItem();
    const fuel = furnace.fuelItem();
    const input = furnace.inputItem();
    console.log(`- Input: ${input?.name} x${input?.count}`);
    console.log(`- Fuel: ${fuel?.name} x${fuel?.count}`);
    console.log(`- Output: ${out?.name} x${out?.count}`);
    if (out) {
      await furnace.takeOutput();
      console.log(`Took output: ${out.name} x${out.count}`);
    }
    furnace.close();
  } catch (err) {
    console.log('Failed furnace 1:', err.message);
  }
}

// 3. Check furnace at (295, 72, -57)
const f2Pos = new Vec3(295, 72, -57);
const f2 = bot.blockAt(f2Pos);
if (f2 && f2.name.includes('furnace')) {
  try {
    await bot.lookAt(f2Pos.offset(0.5, 0.5, 0.5), true);
    const furnace = await bot.openFurnace(f2);
    console.log('Furnace 2 (295, 72, -57):');
    const out = furnace.outputItem();
    const fuel = furnace.fuelItem();
    const input = furnace.inputItem();
    console.log(`- Input: ${input?.name} x${input?.count}`);
    console.log(`- Fuel: ${fuel?.name} x${fuel?.count}`);
    console.log(`- Output: ${out?.name} x${out?.count}`);
    if (out) {
      await furnace.takeOutput();
      console.log(`Took output: ${out.name} x${out.count}`);
    }
    furnace.close();
  } catch (err) {
    console.log('Failed furnace 2:', err.message);
  }
}

// 4. Wait for night and dawn
console.log('Current time:', bot.time.timeOfDay);
const startWait = Date.now();
while (Date.now() - startWait < 30000 && !isCancelled()) {
  const tod = bot.time.timeOfDay;
  if (tod >= 12542 && tod < 23460) {
    console.log('Night detected! Attempting to sleep in bed at (294, 72, -55)...');
    const bedBlock = bot.blockAt(new Vec3(294, 72, -55));
    if (bedBlock) {
      try {
        await bot.sleep(bedBlock);
        console.log('Sleeping in bed...');
        await sleep(5000);
        await bot.wake();
        console.log('Woke up! New time:', bot.time.timeOfDay);
        break;
      } catch (e) {
        console.log('Sleep failed:', e.message);
      }
    }
  } else if (tod < 12542 && tod > 0) {
    if (tod < 1000) {
      console.log('Dawn reached! Time:', tod);
      break;
    }
  }
  await sleep(1000);
}

console.log('End of Program 624. Inv:', lib.inv(), 'Time:', bot.time.timeOfDay);
