// programs/263-find-openings.js
console.log('=== Program 263: Find All Connected Air Blocks ===');
const pos = bot.entity.position.floored();

const visited = new Set();
const queue = [pos];
visited.add(`${pos.x},${pos.y},${pos.z}`);

const airBlocks = [];

while (queue.length > 0 && airBlocks.length < 500) {
  const curr = queue.shift();
  airBlocks.push(curr);
  
  for (const offset of [
    new Vec3(1, 0, 0), new Vec3(-1, 0, 0),
    new Vec3(0, 1, 0), new Vec3(0, -1, 0),
    new Vec3(0, 0, 1), new Vec3(0, 0, -1)
  ]) {
    const next = curr.plus(offset);
    const key = `${next.x},${next.y},${next.z}`;
    if (!visited.has(key)) {
      visited.add(key);
      const b = bot.blockAt(next);
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        queue.push(next);
      }
    }
  }
}

console.log(`Found ${airBlocks.length} connected air blocks!`);
// Find max/min y, x, z
let minY = 999, maxY = -999;
for (const b of airBlocks) {
  if (b.y < minY) minY = b.y;
  if (b.y > maxY) maxY = b.y;
}
console.log(`Connected air Y range: ${minY} to ${maxY}`);

// Print the air blocks with highest Y
const topAir = airBlocks.filter(b => b.y >= maxY - 2);
console.log(`Top air blocks (y >= ${maxY - 2}):`);
for (const b of topAir.slice(0, 15)) {
  console.log(`  (${b.x}, ${b.y}, ${b.z})`);
}

// Print the air blocks with lowest Y
const bottomAir = airBlocks.filter(b => b.y <= minY + 2);
console.log(`Bottom air blocks (y <= ${minY + 2}):`);
for (const b of bottomAir.slice(0, 10)) {
  console.log(`  (${b.x}, ${b.y}, ${b.z})`);
}

// Also check Beta's status
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
