// programs/488-scan-fortress-staircase-and-shelter.js
console.log('=== Program 488: Scan Fortress Staircase & Secure Position ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check surrounding blocks to ensure Alpha is safe from falling or mobs
const pos = bot.entity.position;
const curX = Math.round(pos.x);
const curY = Math.round(pos.y);
const curZ = Math.round(pos.z);
console.log(`Current pos grid: (${curX}, ${curY}, ${curZ})`);

const floor = bot.blockAt(new Vec3(curX, curY - 1, curZ))?.name;
console.log(`Floor underfoot: ${floor}`);

// 2. Scan for nether_brick_stairs or nether_bricks between (43, 53, -179) and (32, 68, -190)
const stairs = bot.findBlocks({
  matching: b => b.name.includes('stairs'),
  maxDistance: 24,
  count: 20
});
console.log(`Found ${stairs.length} stair blocks:`);
for (const st of stairs) {
  console.log(`- Stair at ${lib.fmt(st)}`);
}

// 3. Scan for nether_brick walkway blocks at y=53..55
const walkway = bot.findBlocks({
  matching: b => b.name === 'nether_bricks',
  maxDistance: 24,
  count: 30
});
console.log(`Found ${walkway.length} nether_bricks blocks nearby`);
for (const w of walkway.slice(0, 10)) {
  console.log(`- Brick at ${lib.fmt(w)}`);
}

// 4. Check pathfinder path to (32, 68, -190)
const goal = new goals.GoalNear(32, 68, -190, 2);
console.log('Checking path to Blaze Spawner at (32, 68, -190)...');
try {
  // Try finding path
  const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, goal);
  console.log(`Path status: ${path.status}, cost: ${path.cost}, steps: ${path.path.length}`);
  if (path.path.length > 0) {
    console.log(`First 5 path steps:`, path.path.slice(0, 5).map(p => `(${p.x}, ${p.y}, ${p.z})`).join(' -> '));
  }
} catch (e) {
  console.log('Path error:', e.message);
}

// 5. Check nearby mobs
for (const e of Object.values(bot.entities)) {
  if (['blaze', 'wither_skeleton', 'piglin'].includes(e.name)) {
    const d = e.position.distanceTo(bot.entity.position);
    if (d < 20) console.log(`Nearby hostile: ${e.name} at ${lib.fmt(e.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat(`team: Alpha unlocked [A Terrible Fortress] at ${lib.fmt(bot.entity.position)}! Only ${bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1)}m from Blaze Spawner!`);
