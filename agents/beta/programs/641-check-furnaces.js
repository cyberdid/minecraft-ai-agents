const furnaces = bot.findBlocks({ matching: b => b.name.includes('furnace'), maxDistance: 10 });
console.log('Furnaces nearby:', furnaces);

for (const fPos of furnaces) {
  const fBlock = bot.blockAt(fPos);
  try {
    const f = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${fPos}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    // If there is output, take it!
    if (f.outputItem()) {
      await f.takeOutput();
      console.log(`Took output from furnace at ${fPos}!`);
    }
    await f.close();
  } catch (e) {
    console.log(`Could not open furnace at ${fPos}:`, e.message);
  }
}

console.log('Inventory after checking furnaces:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

const time = bot.time.timeOfDay;
console.log('Time of day:', time);
