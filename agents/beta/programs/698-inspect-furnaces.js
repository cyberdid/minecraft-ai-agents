// programs/698-inspect-furnaces.js
console.log('=== Program 698: Inspect Furnaces ===');
const furnaces = bot.findBlocks({ matching: mcData.blocksByName.furnace.id, maxDistance: 12 });
console.log(`Found ${furnaces.length} furnaces:`);
for (const fp of furnaces) {
  try {
    const b = bot.blockAt(fp);
    const f = await bot.openFurnace(b);
    console.log(`Furnace at ${lib.fmt(fp)}: input:`, f.inputItem()?.name, 'fuel:', f.fuelItem()?.name, 'output:', f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty');
    if (f.outputItem()) {
      await f.takeOutput();
      console.log('Took output from furnace!');
    }
    await f.close();
  } catch (e) {
    console.log(`Error checking furnace at ${lib.fmt(fp)}:`, e.message);
  }
}
console.log('Inv after furnace check:', JSON.stringify(lib.inv()));
