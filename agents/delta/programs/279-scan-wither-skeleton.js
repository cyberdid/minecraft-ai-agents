// programs/279-scan-wither-skeleton.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();

// Find wither skeletons and hostiles
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 25);
for (const m of mobs) {
  console.log(`Mob: ${m.name} at ${lib.fmt(m.position)} (dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m)`);
}

// Check blocks immediately around Delta at (40, 65, -176)
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`(${p.x}, ${p.y}, ${p.z}): ${b.name}`);
      }
    }
  }
}
