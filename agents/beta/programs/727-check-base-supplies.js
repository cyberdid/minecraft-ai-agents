// programs/727-check-base-supplies.js
console.log('=== Program 727: Inspect Base Furnaces and Chests ===');
const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];
for (const pos of furnaces) {
  const b = bot.blockAt(pos);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(pos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      await f.close();
    } catch (e) {
      console.log(`Error opening furnace at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// Also check chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openChest(chestBlock);
  console.log('Chest items:');
  for (const item of chest.containerItems()) {
    console.log(` - ${item.name} x ${item.count}`);
  }
  await chest.close();
}
