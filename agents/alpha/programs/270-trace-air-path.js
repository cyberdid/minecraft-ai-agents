// programs/270-trace-air-path.js
console.log('=== Program 270: Trace Walkable Air Path ===');
const start = bot.entity.position.floored();

// We want to find if there is a walkable path (standing on solid block, 2 air blocks high)
function isWalkable(p) {
  const floor = bot.blockAt(p.offset(0, -1, 0));
  const feet = bot.blockAt(p);
  const head = bot.blockAt(p.offset(0, 1, 0));
  
  if (!floor || floor.boundingBox !== 'block') return false;
  if (!feet || (feet.name !== 'air' && feet.name !== 'cave_air')) return false;
  if (!head || (head.name !== 'air' && head.name !== 'cave_air')) return false;
  return true;
}

const queue = [[start]];
const visited = new Set();
visited.add(`${start.x},${start.y},${start.z}`);

let bestPath = [start];

while (queue.length > 0 && visited.size < 3000) {
  const path = queue.shift();
  const curr = path[path.length - 1];
  
  if (curr.y > bestPath[bestPath.length - 1].y) {
    bestPath = path;
  }
  
  // Possible moves: dx/dz in [-1, 0, 1], dy in [-1, 0, 1] (steps, jumps, drops up to 1)
  for (const dx of [-1, 0, 1]) {
    for (const dz of [-1, 0, 1]) {
      if (dx === 0 && dz === 0) continue;
      if (Math.abs(dx) + Math.abs(dz) > 1) continue; // cardinal only
      
      for (const dy of [1, 0, -1, -2]) {
        const next = curr.offset(dx, dy, dz);
        const key = `${next.x},${next.y},${next.z}`;
        if (!visited.has(key)) {
          visited.add(key);
          if (isWalkable(next)) {
            // Check clearance for jump
            if (dy === 1) {
              const headAbove = bot.blockAt(curr.offset(0, 2, 0));
              if (headAbove && headAbove.name !== 'air' && headAbove.name !== 'cave_air') continue;
            }
            queue.push([...path, next]);
          }
        }
      }
    }
  }
}

console.log(`Visited ${visited.size} positions. Best walkable path length: ${bestPath.length}, reaches y=${bestPath[bestPath.length - 1].y}`);
console.log('Path points:');
for (let i = 0; i < bestPath.length; i += Math.max(1, Math.floor(bestPath.length / 8))) {
  console.log(`  step ${i}: ${lib.fmt(bestPath[i])}`);
}
console.log(`  end: ${lib.fmt(bestPath[bestPath.length - 1])}`);
