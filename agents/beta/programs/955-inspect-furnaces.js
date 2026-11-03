console.log('=== Program 955: Inspect Base Furnaces & Water Bucket ===');
globalThis.isProgramCancelled = isCancelled;

const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

console.log('Inspecting 3 Base Furnaces...');
for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      const inItem = furnace.inputItem();
      const fuelItem = furnace.fuelItem();
      const outItem = furnace.outputItem();
      console.log(`Furnace at ${lib.fmt(fp)}: input=${inItem ? `${inItem.name}x${inItem.count}` : 'empty'}, fuel=${fuelItem ? `${fuelItem.name}x${fuelItem.count}` : 'empty'}, output=${outItem ? `${outItem.name}x${outItem.count}` : 'empty'}`);

      // Take output if iron_ingot or cooked food
      if (outItem) {
        console.log(`Withdrawing ${outItem.count} ${outItem.name} from furnace...`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fp)} notice:`, e.message);
    }
  }
}

// Check if we have an empty bucket and can fill it with water
const bucket = bot.inventory.items().find(i => i.name === 'bucket');
if (bucket && lib.count('water_bucket') === 0) {
  console.log('Found empty bucket! Scanning nearby water...');
  const waterBlock = bot.findBlock({ matching: b => b && b.name === 'water' && b.metadata === 0, maxDistance: 16 });
  if (waterBlock) {
    console.log(`Water source located at ${lib.fmt(waterBlock.position)}`);
  }
}

// Ensure armor and weapon equipped
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Beta gear after check:', JSON.stringify(lib.inv()));
return {
  inv: lib.inv(),
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food
};
