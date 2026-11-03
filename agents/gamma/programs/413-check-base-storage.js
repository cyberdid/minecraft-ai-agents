// programs/413-check-base-storage.js
console.log('=== CHECK BASE FURNACES & CHEST ===');

// Check furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took output: ${f.outputItem()?.name}`);
      }
      f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fp)} err:`, e.message);
    }
  }
}

// Check chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    console.log('Chest items:', chest.items().map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    chest.close();
  } catch (e) {
    console.log('Chest err:', e.message);
  }
}

console.log('Current inv:', JSON.stringify(lib.inv()));
