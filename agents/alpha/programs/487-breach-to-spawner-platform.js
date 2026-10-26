// programs/487-breach-to-spawner-platform.js
console.log('=== Program 487: Breach to Blaze Spawner Platform ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const spawner = new Vec3(32, 68, -190);
console.log(`Target: ${lib.fmt(spawner)}, distance: ${bot.entity.position.distanceTo(spawner).toFixed(1)}m`);

// Inspect line from (43, 65, -178) to (32, 68, -190)
const steps = [
  { x: 41, y: 65, z: -180 },
  { x: 39, y: 66, z: -182 },
  { x: 37, y: 66, z: -184 },
  { x: 35, y: 67, z: -186 },
  { x: 33, y: 67, z: -188 },
  { x: 32, y: 68, z: -189 }
];

for (const s of steps) {
  const floor = bot.blockAt(new Vec3(s.x, s.y - 1, s.z));
  const feet = bot.blockAt(new Vec3(s.x, s.y, s.z));
  const head = bot.blockAt(new Vec3(s.x, s.y + 1, s.z));
  console.log(`Step (${s.x}, ${s.y}, ${s.z}): floor=${floor?.name || 'air'}, feet=${feet?.name || 'air'}, head=${head?.name || 'air'}`);
}

// Check nearby entities
for (const e of Object.values(bot.entities)) {
  if (['blaze', 'wither_skeleton'].includes(e.name)) {
    const d = e.position.distanceTo(bot.entity.position);
    if (d < 24) console.log(`Mob ${e.name} at ${lib.fmt(e.position)} (dist ${d.toFixed(1)}m)`);
  }
}
