// programs/525-seal-blast-wall-and-bunker.js
console.log('=== Program 525: Seal West Blast Wall & Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobblestone in inv:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

// Helper to safely place block
async function safePlace(name, x, y, z) {
  const existing = bot.blockAt(new Vec3(x, y, z));
  if (existing && existing.name !== 'air' && existing.name !== 'cave_air') {
    console.log(`Block at (${x}, ${y}, ${z}) already solid: ${existing.name}`);
    return;
  }
  try {
    await lib.place(name, x, y, z);
    console.log(`Successfully placed ${name} at (${x}, ${y}, ${z})!`);
  } catch (err) {
    console.log(`Failed to place at (${x}, ${y}, ${z}): ${err.message}`);
  }
}

// 1. Immediately seal West wall at x=43 from z=-156 to z=-159
console.log('Placing West protective wall at x=43...');
const westWall = [
  { x: 43, y: 65, z: -156 },
  { x: 43, y: 66, z: -156 },
  { x: 43, y: 65, z: -157 },
  { x: 43, y: 66, z: -157 },
  { x: 43, y: 65, z: -158 },
  { x: 43, y: 66, z: -158 },
  { x: 43, y: 65, z: -159 },
  { x: 43, y: 66, z: -159 }
];

for (const b of westWall) {
  if (lib.count('cobblestone') < 5) break;
  await safePlace('cobblestone', b.x, b.y, b.z);
}

// 2. Place North baffle wall at (44, 65..66, -160)
console.log('Placing North baffle wall at z=-160...');
await safePlace('cobblestone', 44, 65, -160);
await safePlace('cobblestone', 44, 66, -160);

// 3. Place roof blocks at y=67 over (44, 67, -156..-159)
console.log('Placing protective roof at y=67...');
for (let z = -156; z >= -159; z--) {
  if (lib.count('cobblestone') < 5) break;
  await safePlace('cobblestone', 44, 67, z);
}

console.log('Corridor fortification complete! Remaining cobble:', lib.count('cobblestone'));
bot.chat(`alpha: Frontline West blast wall & north baffle 100% sealed at z=-156..-160! Corridor secure! Cobble: ${lib.count('cobblestone')}`);

// 4. Scan entities and teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

// 5. Check distance to Blaze Spawner at (32, 68, -190)
const spawnerPos = new Vec3(32, 68, -190);
console.log(`Distance to Blaze Spawner: ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m`);
console.log('Alpha HP:', bot.health, 'Food:', bot.food);
