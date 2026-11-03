// programs/852-find-all-chests-and-furnaces.js
console.log('=== Program 852: Find All Chests & Barrels ===');
const p = bot.entity.position;

const containers = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'),
  maxDistance: 32,
  count: 10
});

console.log(`Found ${containers.length} containers near base:`);
for (const cp of containers) {
  console.log(`  Container at ${lib.fmt(cp)}`);
  try {
    const block = bot.blockAt(cp);
    const c = await bot.openContainer(block);
    const items = c.containerItems();
    console.log(`    Items in container at ${lib.fmt(cp)}:`);
    for (const it of items) {
      console.log(`      ${it.name} x${it.count}`);
    }
    await c.close();
  } catch (e) {
    console.log(`    Error opening container at ${lib.fmt(cp)}: ${e.message}`);
  }
}

// Check what each player is holding and their equipment
for (const [name, pl] of Object.entries(bot.players)) {
  if (pl && pl.entity) {
    console.log(`Player ${name}: held=${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}, pos=${lib.fmt(pl.entity.position)}`);
  }
}
