// programs/413-inspect-spawner-front.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// Check blocks directly towards spawner (from x=36..33, z=-183..-189, y=66..68)
const blocks = [];
for (let z = -183; z >= -188; z--) {
  for (let x = 37; x >= 34; x--) {
    for (let y = 66; y <= 68; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        blocks.push(`${b.name} at (${x}, ${y}, ${z})`);
      }
    }
  }
}

console.log(`Solid blocks in front (${blocks.length}):`);
for (const line of blocks.slice(0, 15)) console.log('  ' + line);

// Check nearby blazes
const blazes = Object.values(bot.entities)
  .filter(e => e.name === 'blaze' && e.isValid)
  .map(e => ({ pos: lib.fmt(e.position), dist: bot.entity.position.distanceTo(e.position).toFixed(1), hp: e.health }));

console.log(`Blazes nearby (${blazes.length}):`, JSON.stringify(blazes));

// Check ground item drops
const items = Object.values(bot.entities)
  .filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10)
  .map(e => ({ pos: lib.fmt(e.position), dist: bot.entity.position.distanceTo(e.position).toFixed(1) }));

console.log(`Item drops nearby (${items.length}):`, JSON.stringify(items));
