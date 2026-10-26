// programs/281-check-base-supplies.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Find all chests in base
const chests = bot.findBlocks({
  matching: b => b.name === 'chest',
  maxDistance: 15,
  count: 10
});

console.log(`Found ${chests.length} chests`);
for (const p of chests) {
  console.log(`Chest at ${lib.fmt(p)}`);
  try {
    const chestBlock = bot.blockAt(p);
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Contents of chest at ${lib.fmt(p)}:`);
    if (items.length === 0) {
      console.log('  (empty)');
    } else {
      for (const item of items) {
        console.log(`  ${item.name} x${item.count}`);
      }
    }
    chest.close();
  } catch (err) {
    console.log(`Failed to open chest at ${lib.fmt(p)}: ${err.message}`);
  }
}

// Find furnaces
const furnaces = bot.findBlocks({
  matching: b => b.name === 'furnace' || b.name === 'smoker' || b.name === 'blast_furnace',
  maxDistance: 15,
  count: 10
});
console.log(`Found ${furnaces.length} furnaces`);
for (const p of furnaces) {
  try {
    const fb = bot.blockAt(p);
    const f = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(p)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    f.close();
  } catch (err) {
    console.log(`Failed to open furnace at ${lib.fmt(p)}: ${err.message}`);
  }
}

// Find dropped items around base
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 15);
console.log(`Found ${drops.length} dropped items around base`);
for (const d of drops) {
  console.log(`Drop at ${lib.fmt(d.position)}`);
}
