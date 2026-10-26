// programs/222-scan-base-resources.js
console.log('=== SCAN BASE RESOURCES ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. All containers within 20 blocks
const containers = bot.findBlocks({
  matching: b => b && (b.name.includes('chest') || b.name.includes('barrel') || b.name.includes('shulker')),
  maxDistance: 20,
  count: 10
});
console.log(`Containers found (${containers.length}):`);
for (const cp of containers) {
  const cb = bot.blockAt(cp);
  try {
    const c = await bot.openContainer(cb);
    console.log(`Container at ${lib.fmt(cp)} (${cb.name}):`);
    const items = c.items();
    if (items.length === 0) console.log('  (empty)');
    for (const item of items) {
      console.log(`  - ${item.name} x${item.count}`);
    }
    await c.close();
  } catch (e) {
    console.log(`Container at ${lib.fmt(cp)} error:`, e.message);
  }
}

// 2. All dropped items around base within 25 blocks
const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 25);
console.log(`Dropped items within 25m (${dropped.length}):`);
for (const it of dropped) {
  console.log(` - Item entity ${it.id} at ${lib.fmt(it.position)}`);
}

// 3. Check what trees/logs/cobblestone are near base
const logs = bot.findBlocks({
  matching: b => b && b.name.includes('log'),
  maxDistance: 25,
  count: 10
});
console.log(`Nearby tree logs (${logs.length}):`, logs.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// 4. Check stone/cobblestone nearby
const stone = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'cobblestone'),
  maxDistance: 20,
  count: 5
});
console.log(`Nearby stone/cobble (${stone.length}):`, stone.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));
