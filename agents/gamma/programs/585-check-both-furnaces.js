// programs/585-check-both-furnaces.js
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    const fn = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(fPos)}:`);
    console.log('  input:', fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty');
    console.log('  fuel:', fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty');
    console.log('  output:', fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty');
    if (fn.outputItem() && fn.outputItem().name === 'iron_ingot') {
      await fn.takeOutput();
      console.log(`Took ${fn.outputItem().count} iron ingots from ${lib.fmt(fPos)}`);
    }
    await fn.close();
  }
}

console.log('Gamma inventory now:', lib.inv());

// If we have 3 iron ingots, craft a bucket and fill with water!
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket...');
  await lib.craft('bucket', 1);
  console.log('Bucket crafted!');
  await lib.fillBucket('water');
  console.log('Water bucket obtained!');
  bot.chat('gamma: I have a water_bucket ready to quench lava at (299, 72, -54)!');
}
