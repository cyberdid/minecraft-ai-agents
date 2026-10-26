// programs/233-mine-coal-and-inspect-iron.js
console.log('=== MINE COAL & SEARCH ACCESSIBLE IRON ORE ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Craft birch_planks from log
if (lib.count('birch_log') > 0) {
  console.log('Crafting planks from birch_log...');
  await lib.craft('birch_planks', 4);
}
console.log('Planks count:', lib.count('*_planks'));

// 2. Mine 3 coal_ore at (293, 66, -43)
console.log('Mining coal_ore...');
try {
  const got = await lib.collect('coal_ore', 3, { maxBelow: 10 });
  console.log('Got coal:', JSON.stringify(got));
} catch (e) {
  console.log('Coal collect note:', e.message);
}
console.log('Coal count:', lib.count('coal'));

// 3. Search for ANY iron_ore within 64 blocks, and sort by Y descending (highest Y first!)
const allIron = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 64,
  count: 20
});
console.log(`\nFound ${allIron.length} iron ore blocks within 64m:`);
const sortedIron = allIron.map(p => ({
  pos: p,
  name: bot.blockAt(p)?.name,
  dist: bot.entity.position.distanceTo(p).toFixed(1)
})).sort((a, b) => b.pos.y - a.pos.y);

for (const it of sortedIron) {
  console.log(` - ${it.name} at ${lib.fmt(it.pos)} (y=${it.pos.y}, dist=${it.dist}m)`);
}

// 4. Test pathfinding to the highest reachable iron ore
for (const it of sortedIron.slice(0, 3)) {
  const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, new goals.GoalNear(it.pos.x, it.pos.y, it.pos.z, 2));
  console.log(`Path to ${lib.fmt(it.pos)} (y=${it.pos.y}): status=${path.status} cost=${path.cost?.toFixed(1)} len=${path.path?.length}`);
}

console.log('\nPos now:', lib.fmt(bot.entity.position));
console.log('Inv now:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
