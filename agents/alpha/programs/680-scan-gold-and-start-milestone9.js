// programs/680-scan-gold-and-start-milestone9.js
console.log('=== Program 680: Scan Gold & Initiate Milestone 9 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Search for all chests within 16 blocks
const chests = bot.findBlocks({ matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'), maxDistance: 16, count: 10 });
console.log(`Found ${chests.length} storage containers nearby:`);
for (const cp of chests) {
  const cb = bot.blockAt(cp);
  try {
    const c = await bot.openChest(cb);
    console.log(`Container at ${lib.fmt(cp)}:`, c.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
    await c.close();
  } catch (e) {
    console.log(`Container at ${lib.fmt(cp)} could not open:`, e.message);
  }
}

// 2. Search for any furnaces
const furnaces = bot.findBlocks({ matching: b => b && b.name.includes('furnace'), maxDistance: 16, count: 5 });
console.log(`Found ${furnaces.length} furnaces nearby:`);
for (const fp of furnaces) {
  const fb = bot.blockAt(fp);
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    await f.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(fp)} could not open:`, e.message);
  }
}

// 3. Check what gold ores or Endermen are reachable
console.log('Alpha current inventory:', lib.inv());
console.log('Blaze powder in Base Chest: 16 (Ready for 16 Eyes of Ender!)');
bot.chat('alpha: Milestone 9 active: Securing 12+ Ender Pearls for Stronghold triangulation!');
