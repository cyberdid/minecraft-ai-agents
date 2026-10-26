// programs/274-scan-nether-trail-terrain.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();

// Check nearby hostiles
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 20);
for (const h of hostiles) {
  console.log(`Hostile: ${h.name} at ${lib.fmt(h.position)} (dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m)`);
}

// Check terrain blocks around Delta (-3 to +3 in x, y, z)
console.log('--- SURROUNDING BLOCKS ---');
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const p = bot.entity.position.offset(dx, -1, dz);
    const floor = bot.blockAt(p);
    const atFeet = bot.blockAt(p.offset(0, 1, 0));
    console.log(`offset(${dx}, ${dz}): floor=${floor?.name} atFeet=${atFeet?.name}`);
  }
}

// Check route to (63, 65, -5)
console.log('Direction to East Ridge entrance (63, 65, -5):');
const target = new Vec3(63, 65, -5);
console.log('Dist to (63, 65, -5):', bot.entity.position.distanceTo(target).toFixed(1) + 'm');
