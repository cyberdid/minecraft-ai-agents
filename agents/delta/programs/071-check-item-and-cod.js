// programs/071-check-item-and-cod.js
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Check dropped items
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || e.name !== 'item') continue;
  const dist = bot.entity.position.distanceTo(e.position);
  console.log(`Item entity at ${lib.fmt(e.position)}, dist ${Math.round(dist)}`);
  // Try to inspect metadata / item
  if (e.metadata) {
    console.log('Item metadata:', JSON.stringify(e.metadata));
  }
}

// 2. Check nearest cod
const cods = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || e.name !== 'cod') continue;
  const dist = bot.entity.position.distanceTo(e.position);
  cods.push({ pos: e.position, dist: Math.round(dist) });
}
cods.sort((a,b) => a.dist - b.dist);
console.log(`Found ${cods.length} cod. Nearest 5:`, JSON.stringify(cods.slice(0, 5)));
