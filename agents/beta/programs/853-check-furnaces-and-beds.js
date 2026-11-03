// programs/853-check-furnaces-and-beds.js
console.log('=== Program 853: Check Furnaces & Beds ===');

const fPositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -57)
];

for (const fp of fPositions) {
  const b = bot.blockAt(fp);
  if (b) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fp)}:`);
      console.log(`  Input: ${f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty'}`);
      console.log(`  Fuel: ${f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty'}`);
      console.log(`  Output: ${f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'}`);
      // Take output if it's food or ingots
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Error reading furnace at ${lib.fmt(fp)}: ${e.message}`);
    }
  }
}

// Check beds
const beds = bot.findBlocks({
  matching: b => b && b.name.endsWith('_bed'),
  maxDistance: 16,
  count: 5
});
console.log(`Found ${beds.length} beds:`, beds.map(b => lib.fmt(b)));

// Eat if we have food
for (const item of bot.inventory.items()) {
  if (['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread', 'apple'].includes(item.name)) {
    console.log(`Eating ${item.name}...`);
    try {
      await bot.equip(item, 'hand');
      await bot.consume();
    } catch (e) {}
  }
}

console.log(`Beta status: health=${bot.health}, food=${bot.food}, timeOfDay=${bot.time.timeOfDay}`);
