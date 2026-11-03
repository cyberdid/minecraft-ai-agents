console.log('Bot pos:', bot.entity.position);

// Check blocks around bot from y=58 to y=65
for (let dx = -3; dx <= 3; dx++) {
  for (let dz = -3; dz <= 3; dz++) {
    for (let dy = -1; dy <= 4; dy++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'water') {
        console.log(`(${p.x}, ${p.y}, ${p.z}): ${b.name}`);
      }
    }
  }
}
