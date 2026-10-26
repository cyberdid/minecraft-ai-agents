// programs/288-print-visited-positions.js
console.log('=== Program 288: Check All 42 Connected Air Positions ===');
const start = bot.entity.position.floored();

function isAir(b) {
  return b && (b.name === 'air' || b.name === 'cave_air');
}

const visited = new Set();
const queue = [start];
visited.add(`${start.x},${start.y},${start.z}`);

const found = [];

while (queue.length > 0) {
  const curr = queue.shift();
  found.push(curr);
  
  for (const d of [
    new Vec3(1, 0, 0), new Vec3(-1, 0, 0),
    new Vec3(0, 1, 0), new Vec3(0, -1, 0),
    new Vec3(0, 0, 1), new Vec3(0, 0, -1)
  ]) {
    const next = curr.plus(d);
    const key = `${next.x},${next.y},${next.z}`;
    if (!visited.has(key)) {
      visited.add(key);
      const b = bot.blockAt(next);
      if (isAir(b)) {
        queue.push(next);
      }
    }
  }
}

console.log(`Found ${found.length} 3D connected air blocks!`);
for (const p of found.slice(0, 45)) {
  console.log(`  air at ${lib.fmt(p)}`);
}

bot.chat('gamma: Gamma, Beta is at (297, 39, 2). Walk South from the shaft to (297, 72, 2) to be right above Beta!');
