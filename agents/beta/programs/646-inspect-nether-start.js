console.log('Bot pos:', bot.entity.position);
console.log('Bot health:', bot.health, 'food:', bot.food);

// Check blocks in a 5x5 around bot
for (let dx = -2; dx <= 2; dx++) {
  for (let dy = -1; dy <= 2; dy++) {
    for (let dz = -2; dz <= 2; dz++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air') {
        console.log(`(${p.x}, ${p.y}, ${p.z}): ${b.name}`);
      }
    }
  }
}

// Check what pathfinder says about moving to (46, 65, -8)
const moves = new Movements(bot, mcData);
const path = bot.pathfinder.getPathTo(moves, new goals.GoalNear(46, 65, -8, 1));
console.log('Path to (46, 65, -8): status =', path.status, 'nodes =', path.path ? path.path.length : 0);
if (path.status === 'noPath') {
  console.log('No path! Why? Let us inspect terrain towards x=46..52, z=-8');
}
