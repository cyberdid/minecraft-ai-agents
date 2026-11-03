console.log('=== PROGRAM 690: SEARCH ALL CHESTS & CONTAINERS IN BASE ===');

const chests = bot.findBlocks({ matching: b => b && b.name.includes('chest'), maxDistance: 48, count: 20 });
console.log(`Chests found in 48m: ${chests.length}`);

for (const cp of chests) {
  const cb = bot.blockAt(cp);
  console.log(`\n--- Inspecting Chest at ${lib.fmt(cp)} (${cb.name}) ---`);
  try {
    const container = await bot.openContainer(cb);
    const items = container.containerItems();
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    container.close();
  } catch (err) {
    console.log('  Container open error:', err.message);
  }
}

// Check all furnaces / barrels / dispensers
const furnaces = bot.findBlocks({ matching: b => b && (b.name.includes('furnace') || b.name.includes('barrel') || b.name.includes('dispenser') || b.name.includes('dropper') || b.name.includes('hopper')), maxDistance: 48, count: 20 });
console.log(`\nOther containers found: ${furnaces.length}`);
for (const fp of furnaces) {
  const fb = bot.blockAt(fp);
  console.log(`  ${fb.name} at ${lib.fmt(fp)}`);
}

// Check all dropped items
const dropped = Object.values(bot.entities).filter(e => e.name === 'item');
console.log(`\nDropped items in render: ${dropped.length}`);
for (const d of dropped) {
  console.log(`  Item at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}

console.log('\nTeammates:');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username)) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}`);
}
