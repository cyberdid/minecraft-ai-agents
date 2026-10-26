// programs/248-check-second-furnace-and-set-spawn.js
console.log('=== Step 6: Check furnace at (295, 72, -57) and set spawn on bed ===');

// 1. Inspect furnace at (295, 72, -57)
const fPos = new Vec3(295, 72, -57);
const fBlock = bot.blockAt(fPos);
if (fBlock && fBlock.name.includes('furnace')) {
  try {
    const f = await bot.openFurnace(fBlock);
    console.log('Furnace at (295, 72, -57):', {
      input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : null,
      fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : null,
      output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : null,
    });
    if (f.outputItem()) {
      await f.takeOutput();
      console.log('Took output from furnace (295, 72, -57).');
    }
    f.close();
  } catch (e) {
    console.log('Error opening furnace (295, 72, -57):', e.message);
  }
}

// 2. Set spawn at the bed at (294, 72, -56)
try {
  console.log('Setting spawn at bed (294, 72, -56)...');
  await lib.setSpawn();
  console.log('Spawn set successfully!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 3. Check time and chat
const t = lib.time();
console.log('Current time:', t);

bot.chat(`beta: Set spawn at bed. Night in ${t.secondsUntilNight}s. Safe inside base.`);
