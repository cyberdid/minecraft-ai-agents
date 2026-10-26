// programs/504-inspect-base-and-team.js
console.log('=== Program 504: Inspect Base & Team ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)} dist=${d.toFixed(1)}m`);
  } else {
    console.log(`Player ${name}: not in visual range / offline`);
  }
}

// 2. Chests nearby
const chests = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest'),
  maxDistance: 10,
  count: 5
});
console.log(`Found ${chests.length} chests nearby.`);
for (const cPos of chests) {
  try {
    const chestBlock = bot.blockAt(cPos);
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`).join(', ');
    console.log(`Chest at ${lib.fmt(cPos)}: ${items || 'empty'}`);
    await chest.close();
  } catch (err) {
    console.log(`Error opening chest at ${lib.fmt(cPos)}: ${err.message}`);
  }
}

// 3. Furnaces nearby
const furnaces = bot.findBlocks({
  matching: b => b && (b.name === 'furnace' || b.name === 'blast_furnace'),
  maxDistance: 10,
  count: 5
});
console.log(`Found ${furnaces.length} furnaces nearby.`);
for (const fPos of furnaces) {
  try {
    const fBlock = bot.blockAt(fPos);
    const furnace = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${lib.fmt(fPos)}: input=${furnace.inputItem() ? furnace.inputItem().name + ' x' + furnace.inputItem().count : 'none'}, fuel=${furnace.fuelItem() ? furnace.fuelItem().name + ' x' + furnace.fuelItem().count : 'none'}, output=${furnace.outputItem() ? furnace.outputItem().name + ' x' + furnace.outputItem().count : 'none'}`);
    await furnace.close();
  } catch (err) {
    console.log(`Error opening furnace at ${lib.fmt(fPos)}: ${err.message}`);
  }
}

// 4. Alpha inventory
console.log('Alpha inventory:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', ') || 'empty');
