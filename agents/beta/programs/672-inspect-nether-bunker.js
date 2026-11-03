console.log('=== Nether Bunker Inspection ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Check dropped items
const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 16);
console.log(`Dropped items within 16m (${dropped.length}):`);
for (const d of dropped) {
  console.log(`  Item: id=${d.id}, pos=${lib.fmt(d.position)}, dist=${bot.entity.position.distanceTo(d.position).toFixed(1)}m`);
}

// Check chests
const chests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 16 });
console.log('Chests nearby:', chests);
for (const cPos of chests) {
  const cb = bot.blockAt(cPos);
  try {
    const c = await bot.openChest(cb);
    console.log(`Chest at ${cPos} items:`);
    for (const item of c.containerItems()) {
      console.log(`  ${item.name} x${item.count}`);
    }
    await c.close();
  } catch (e) {
    console.log(`Could not open chest at ${cPos}:`, e.message);
  }
}
