console.log('=== Nether Bunker Inspection ===');
console.log('Pos:', bot.entity.position);

const chests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 10 });
console.log('Chests in bunker:', chests);
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    console.log(`Chest at ${cp}:`);
    for (const it of c.containerItems()) {
      console.log(`  ${it.name} x${it.count}`);
    }
    await c.close();
  } catch (e) {
    console.log(`Could not open chest at ${cp}:`, e.message);
  }
}

const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15);
console.log('Dropped items in bunker:', items.length);
for (const it of items) {
  console.log(`  Dropped item id=${it.id}, dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}
await lib.pickup(10);
console.log('Inventory after pickup:', JSON.stringify(lib.inv()));
