console.log('=== Program 911: Search for all chests ===');
const chests = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'),
  maxDistance: 64,
  count: 10
});
console.log(`Found chests/barrels: ${chests.length}`);
for (const cp of chests) {
  console.log(`  chest at ${lib.fmt(cp)}`);
  try {
    const block = bot.blockAt(cp);
    const c = await bot.openChest(block);
    const items = c.containerItems();
    console.log(`  Items in chest at ${lib.fmt(cp)} (${items.length}):`);
    for (const it of items) {
      console.log(`    - ${it.name} x${it.count}`);
    }
    c.close();
  } catch (e) {
    console.log(`    Error opening: ${e.message}`);
  }
}
