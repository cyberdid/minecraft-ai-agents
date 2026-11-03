// programs/796-check-chests-and-furnaces.js
console.log('=== Program 796: Check Chests and Furnaces in Base ===');
const chests = bot.findBlocks({ matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest'), maxDistance: 12 });
console.log('Found chests:', chests.map(c => lib.fmt(c)));

for (const cp of chests) {
  try {
    const cb = bot.blockAt(cp);
    const chest = await bot.openChest(cb);
    console.log(`Chest at ${lib.fmt(cp)}:`, chest.items().map(i => `${i.name}x${i.count}`).join(', '));
    await chest.close();
  } catch (e) {
    console.log(`Error reading chest at ${lib.fmt(cp)}:`, e.message);
  }
}

const furnaces = bot.findBlocks({ matching: b => b && (b.name === 'furnace'), maxDistance: 12 });
console.log('Found furnaces:', furnaces.map(f => lib.fmt(f)));
for (const fp of furnaces) {
  try {
    const fb = bot.blockAt(fp);
    const f = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    await f.close();
  } catch (e) {
    console.log(`Error reading furnace at ${lib.fmt(fp)}:`, e.message);
  }
}
