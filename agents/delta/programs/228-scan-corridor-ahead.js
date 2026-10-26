// programs/228-scan-corridor-ahead.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();

// Teammates check
console.log('--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`${name}: pos ${lib.fmt(p.entity.position)} dist ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  } else {
    console.log(`${name}: not visible or out of range`);
  }
}

// Check nearby hostiles
console.log('--- HOSTILES ---');
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && e.name !== 'piglin' && e.name !== 'zombified_piglin' && bot.entity.position.distanceTo(e.position) < 30);
for (const h of hostiles) {
  console.log(`${h.name} at ${lib.fmt(h.position)} dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
}

// Scan corridor envelope along z=-160 down to -175
console.log('--- BLOCKS SCAN ALONG x=44, 43, 42, 41, 40 ---');
for (let z = -162; z >= -170; z--) {
  let row = `z=${z}: `;
  for (let x = 44; x >= 40; x--) {
    const f = bot.blockAt(new Vec3(x, 64, z))?.name || 'none';
    const w1 = bot.blockAt(new Vec3(x, 65, z))?.name || 'none';
    const w2 = bot.blockAt(new Vec3(x, 66, z))?.name || 'none';
    const r = bot.blockAt(new Vec3(x, 67, z))?.name || 'none';
    row += `[x${x}: f=${f}, y65=${w1}, y66=${w2}, r=${r}] `;
  }
  console.log(row);
}

// Distance to spawner at (32, 68, -190)
const spawner = new Vec3(32, 68, -190);
console.log('Distance to spawner (32, 68, -190):', bot.entity.position.distanceTo(spawner).toFixed(1) + 'm');
