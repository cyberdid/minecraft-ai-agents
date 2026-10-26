// programs/069-find-animals-and-hunt.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Scan entities within 64 blocks
const animals = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || !e.position) continue;
  const name = e.name;
  if (['cow', 'pig', 'sheep', 'chicken'].includes(name)) {
    const dist = bot.entity.position.distanceTo(e.position);
    animals.push({ name, pos: e.position, dist: Math.round(dist) });
  }
}

animals.sort((a, b) => a.dist - b.dist);
console.log(`Found ${animals.length} animals nearby:`, JSON.stringify(animals.slice(0, 10)));
