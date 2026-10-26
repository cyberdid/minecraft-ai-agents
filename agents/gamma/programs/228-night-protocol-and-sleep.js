// programs/228-night-protocol-and-sleep.js
console.log('=== NIGHT PROTOCOL AND SLEEP ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Initial time:', JSON.stringify(lib.time()));

// 1. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
  console.log('Base door closed!');
} catch (e) {
  console.log('Door close note:', e.message);
}

// 2. Set spawn on nearest bed
try {
  await lib.setSpawn();
  console.log('Spawn set!');
} catch (e) {
  console.log('Spawn set note:', e.message);
}

// 3. Inspect furnaces for any supplies
for (const pos of [new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fb = bot.blockAt(pos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(pos)}:`,
        'input=', f.inputItem()?.name, f.inputItem()?.count,
        'fuel=', f.fuelItem()?.name, f.fuelItem()?.count,
        'output=', f.outputItem()?.name, f.outputItem()?.count);
      if (f.outputItem()) {
        console.log(`Taking output ${f.outputItem().name} x ${f.outputItem().count}...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Furnace inspect error at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// 4. Wait for canSleep
console.log('Waiting for canSleep (12542 ticks)...');
while (!isCancelled() && !lib.time().canSleep) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  bot.chat('gamma sleeping in base bed to skip night! Beta sleep too!');
  try {
    await lib.sleepInBed();
    console.log('Now sleeping!');
    // Wait until woke up or morning
    while (!isCancelled() && bot.isSleeping) {
      await sleep(1000);
    }
    console.log('Woke up! Time now:', JSON.stringify(lib.time()));
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('End of night protocol. Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));
