// programs/309-craft-flint-and-steel-and-smelt.js
console.log('=== Step: Craft flint & steel, collect 4 iron ingots, craft water bucket ===');

// 1. Craft flint_and_steel
console.log('Crafting flint_and_steel...');
try {
  await lib.craft('flint_and_steel', 1);
  console.log('Crafted flint_and_steel! Count:', lib.count('flint_and_steel'));
} catch (e) {
  console.log('Craft flint_and_steel note:', e.message);
}

// 2. Wait for F1 smelting
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  console.log('Waiting for F1 smelting...');
  let waitCount = 0;
  while (waitCount < 30 && !isCancelled()) {
    const f1 = await bot.openFurnace(f1Block);
    const input = f1.inputItem();
    const output = f1.outputItem();
    console.log(`Furnace check: input=${input ? `${input.name}x${input.count}` : 'none'}, output=${output ? `${output.name}x${output.count}` : 'none'}`);
    if (!input || input.count === 0) {
      if (output && output.count > 0) {
        await f1.takeOutput();
      }
      f1.close();
      break;
    }
    f1.close();
    await sleep(3000);
    waitCount++;
  }
}

console.log('Beta iron_ingots:', lib.count('iron_ingot'));

// 3. Craft bucket if we have 3 iron ingots
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  } catch (e) {
    console.log('Craft bucket note:', e.message);
  }
}

// 4. Fill water bucket if we have an empty bucket
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket at river...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.goTo(294, 72, -50, 2);
    // Find water block
    const waterBlock = bot.findBlock({ matching: b => b.name === 'water', maxDistance: 5 });
    if (waterBlock) {
      await bot.equip(mcData.itemsByName.bucket.id, 'hand');
      await bot.activateBlock(waterBlock);
      await sleep(500);
      console.log('Water filled! Water bucket count:', lib.count('water_bucket'));
    }
    // Return to base
    await lib.goTo(294, 72, -53, 1);
    await lib.goThroughDoor(294, 72, -54);
    console.log('Back inside base safely.');
  } catch (e) {
    console.log('Water fill note:', e.message);
  }
}

console.log('Beta final inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Ready! flint_and_steel: ${lib.count('flint_and_steel')}, water_bucket: ${lib.count('water_bucket')}, iron_ingot: ${lib.count('iron_ingot')}`);
