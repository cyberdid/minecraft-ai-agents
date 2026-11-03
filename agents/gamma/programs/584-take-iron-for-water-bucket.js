// programs/584-take-iron-for-water-bucket.js
console.log('=== CHECK FURNACE FOR IRON INGOTS ===');
const fPos = new Vec3(295, 72, -55);
const fb = bot.blockAt(fPos);
if (!fb) {
  console.log('No furnace at', fPos);
  return;
}

await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 4000 });
const fn = await bot.openFurnace(fb);
console.log('Furnace input:', fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty');
console.log('Furnace fuel:', fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty');
console.log('Furnace output:', fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty');

if (fn.outputItem() && fn.outputItem().name === 'iron_ingot' && fn.outputItem().count >= 3) {
  console.log(`Withdrawing ${fn.outputItem().count} iron ingots...`);
  await fn.takeOutput();
  console.log('Iron ingots taken!');
}
await fn.close();

console.log('Gamma inventory:', lib.inv());

// Craft bucket if 3 iron ingots in inventory
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket...');
  await lib.craft('bucket', 1);
  console.log('Bucket crafted! Total:', lib.count('bucket'));
  
  // Fill bucket with water
  console.log('Filling bucket with water...');
  await lib.fillBucket('water');
  console.log('Water bucket obtained!');
  bot.chat('gamma: I have a water_bucket! Ready to quench Alpha\'s lava at (299, 72, -54) into obsidian!');
}
