// programs/235-check-team.js
console.log('--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`${name}: pos ${lib.fmt(p.entity.position)} dist ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Find any blocks placed past z=-178
for (let z = -178; z >= -192; z--) {
  for (let x = 30; x <= 46; x++) {
    for (let y = 63; y <= 69; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'netherrack' && b.name !== 'nether_bricks' && b.name !== 'nether_brick_fence') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
