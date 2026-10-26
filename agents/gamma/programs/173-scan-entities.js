// programs/173-scan-entities.js
console.log('--- SCAN LOADED ENTITIES NEAR BASE ---');
console.log('Pos:', lib.fmt(bot.entity.position));

const all = Object.values(bot.entities).filter(e => e && e !== bot.entity);
console.log(`Total loaded entities: ${all.length}`);

const grouped = {};
for (const e of all) {
  const type = e.type || e.name;
  if (!grouped[e.name]) grouped[e.name] = [];
  grouped[e.name].push({
    id: e.id,
    pos: lib.fmt(e.position),
    dist: +bot.entity.position.distanceTo(e.position).toFixed(1)
  });
}

for (const [name, list] of Object.entries(grouped)) {
  console.log(`${name} (${list.length}):`, list.slice(0, 3));
}

// Check if any edible crops/bushes nearby
const edibleBlocks = bot.findBlocks({
  matching: b => ['sweet_berry_bush', 'wheat', 'carrots', 'potatoes', 'beetroots', 'brown_mushroom', 'red_mushroom'].includes(b.name),
  maxDistance: 48,
  count: 20
});
console.log(`Edible blocks found: ${edibleBlocks.length}`);
for (const p of edibleBlocks) {
  const b = bot.blockAt(p);
  console.log(`  ${b.name} at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}
