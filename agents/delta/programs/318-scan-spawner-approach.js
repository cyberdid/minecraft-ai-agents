// programs/318-scan-spawner-approach.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'cobble:', lib.count('cobblestone'));

const spawnerPos = new Vec3(32, 68, -190);
const spawnerBlock = bot.blockAt(spawnerPos);
console.log(`Spawner at (32, 68, -190): ${spawnerBlock ? spawnerBlock.name : 'unloaded'}`);

// Scan floor from z=-176 to z=-192 at x=37, 36, 35, 34, 33, 32
console.log('=== APPROACH FLOOR SCAN ===');
for (let z = -176; z >= -192; z--) {
  let line = `z=${z}: `;
  for (let x = 38; x >= 32; x--) {
    let floorFound = 'AIR';
    for (let y = 63; y <= 69; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.boundingBox === 'block') {
        floorFound = `${b.name}@y${y}`;
      }
    }
    line += `x${x}:[${floorFound}] `;
  }
  console.log(line);
}

// Find all Blazes and their positions
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze');
console.log(`Blazes detected: ${blazes.length}`);
for (const b of blazes) {
  console.log(`  Blaze at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m, HP: ${b.metadata?.[9] ?? '?'})`);
}

// Find any dropped items nearby
const drops = Object.values(bot.entities).filter(e => e && (e.name === 'item' || e.type === 'object') && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Drops within 20m: ${drops.length}`);
for (const d of drops) {
  console.log(`  Drop at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}
