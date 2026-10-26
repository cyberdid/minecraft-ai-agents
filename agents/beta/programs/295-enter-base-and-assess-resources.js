// programs/295-enter-base-and-assess-resources.js
console.log('=== Step 51: Enter base, assess supplies in chest & furnaces, sleep night ===');

// 1. Enter base
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  console.log('Door entry note:', e.message);
  await lib.goTo(294, 72, -55, 1);
}

try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 2. Inspect chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

// 3. Inspect Furnaces
for (const z of [-55, -57]) {
  const fb = bot.blockAt(new Vec3(295, 72, z));
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at (295, 72, ${z}):`, {
        input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : null,
        fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : null,
        output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : null
      });
      if (f.outputItem()) await f.takeOutput();
      f.close();
    } catch (e) {}
  }
}

// 4. Check Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha at:', lib.fmt(alpha.position));
}

// 5. Sleep if night
console.log('Time status:', lib.time());
if (lib.time().canSleep) {
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

bot.chat('alpha: Inside base safely. Assessing supplies in chest and furnaces. Night protocol active.');
