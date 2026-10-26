// programs/252-find-iron-or-shield.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check all chests within 30 blocks
const chests = bot.findBlocks({ matching: b => b.name === 'chest', maxDistance: 30, count: 10 });
for (const cp of chests) {
  const cb = bot.blockAt(cp);
  try {
    const c = await bot.openContainer(cb);
    console.log(`Chest at ${lib.fmt(cp)}:`, c.containerItems().map(i => `${i.name} x${i.count}`).join(', '));
    await c.close();
  } catch (e) {}
}

// Check all furnaces within 30 blocks
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 30, count: 10 });
for (const fp of furnaces) {
  const fb = bot.blockAt(fp);
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(fp)}: in=${f.inputItem()?.name} fuel=${f.fuelItem()?.name} out=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    await f.close();
  } catch (e) {}
}

// Check nearby iron ore
const ironOres = bot.findBlocks({ matching: b => b.name.includes('iron_ore'), maxDistance: 32, count: 5 });
console.log('Iron ores found:', ironOres.map(p => lib.fmt(p)));
