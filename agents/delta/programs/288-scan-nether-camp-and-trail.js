// programs/288-scan-nether-camp-and-trail.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${dist.toFixed(1)}m, HP: ${p.entity.metadata?.[9] ?? '?'})`);
  }
}

// Check chests near portal
const chests = bot.findBlocks({
  matching: b => b.name === 'chest',
  maxDistance: 15,
  count: 5
});
console.log(`Chests near portal: ${chests.length}`);
for (const p of chests) {
  try {
    const chestBlock = bot.blockAt(p);
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest at ${lib.fmt(p)}:`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
    }
    chest.close();
  } catch (e) {
    console.log(`Chest at ${lib.fmt(p)} error:`, e.message);
  }
}

// Check dropped items near portal (up to 20m)
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Dropped items near portal: ${drops.length}`);
for (const d of drops) {
  console.log(`  Item drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}

// Check soul fire hill ahead: blocks at x=55..60, z=-2..-6
console.log('Checking soul sand hill fire blocks:');
const fires = bot.findBlocks({
  matching: b => b.name.includes('fire'),
  maxDistance: 30,
  count: 10
});
console.log(`Fire blocks found: ${fires.length}`);
for (const f of fires) {
  console.log(`  Fire at ${lib.fmt(f)} (${bot.blockAt(f).name})`);
}
