// programs/698-check-furnaces-and-gear.js
console.log('=== Checking Gear and Furnaces ===');
console.log('Equipped armor:');
for (let slot = 5; slot <= 8; slot++) {
  const item = bot.inventory.slots[slot];
  console.log(`Slot ${slot}: ${item ? item.name : 'empty'}`);
}
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name || 'empty');

const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fc of furnaceCoords) {
  const b = bot.blockAt(fc);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fc)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took output from furnace at ${lib.fmt(fc)}!`);
      }
      f.close();
    } catch (e) {
      console.log(`Furnace error at ${lib.fmt(fc)}:`, e.message);
    }
  }
}
console.log('Current inv:', lib.inv());
