// programs/590-craft-water-bucket.js
console.log('=== CRAFT WATER BUCKET FOR PORTAL QUENCH ===');
const fPos = new Vec3(295, 72, -55);
const fb = bot.blockAt(fPos);
if (fb) {
  try {
    const fn = await bot.openFurnace(fb);
    const out = fn.outputItem();
    console.log('Furnace output:', out ? `${out.name} x${out.count}` : 'empty');
    if (out && out.name === 'iron_ingot' && out.count >= 3) {
      await fn.takeOutput();
      console.log('Took iron ingots!');
    }
    await fn.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

console.log('Iron in inventory:', lib.count('iron_ingot'));

if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket at crafting table...');
  await lib.craft('bucket', 1);
  console.log('Bucket crafted! Total:', lib.count('bucket'));
}

if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  try {
    await lib.fillBucket('water');
    console.log('SUCCESS: Water bucket filled!');
    bot.chat('gamma: Water bucket filled and ready at (299, 72, -54) to quench Beta\'s lava!');
  } catch (e) {
    console.log('Fill water error:', e.message);
  }
}

console.log('Inventory:', lib.inv());
