// programs/070-scout-food-sources.js
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Check all loaded entities
const found = {};
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || !e.name) continue;
  const name = e.name;
  const dist = Math.round(bot.entity.position.distanceTo(e.position));
  if (!found[name]) found[name] = [];
  found[name].push({ dist, pos: lib.fmt(e.position) });
}

for (const [k, v] of Object.entries(found)) {
  console.log(`Entity ${k} (${v.length}): nearest at dist ${v.sort((a,b)=>a.dist-b.dist)[0].dist}`);
}

// 2. Check surface blocks for food: sweet_berry_bush, wheat, carrots, potatoes
const foodBlocks = bot.findBlocks({
  matching: b => ['sweet_berry_bush', 'wheat', 'carrots', 'potatoes', 'hay_block'].includes(b.name),
  maxDistance: 64,
  count: 10
});
console.log(`Food blocks found: ${foodBlocks.length}`);
for (const fb of foodBlocks) {
  console.log(`Food block ${bot.blockAt(fb).name} at ${lib.fmt(fb)}`);
}

// 3. Check for grass blocks (where animals spawn) around
const grass = bot.findBlocks({ matching: b => b.name === 'grass_block', maxDistance: 48, count: 5 });
console.log(`Grass blocks count nearby: ${grass.length}`);
if (grass.length > 0) {
  console.log(`Sample grass block: ${lib.fmt(grass[0])}`);
}

// 4. Check for water on surface
const water = bot.findBlocks({
  matching: b => b.name === 'water' && bot.blockAt(b.offset(0,1,0))?.name === 'air',
  maxDistance: 48,
  count: 5
});
console.log(`Surface water blocks: ${water.length}`);
