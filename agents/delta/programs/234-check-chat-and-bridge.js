// programs/234-check-chat-and-bridge.js
console.log('--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`${name}: pos ${lib.fmt(p.entity.position)} dist ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Check newly placed blocks past z=-174
for (let z = -174; z >= -188; z--) {
  for (let x = 32; x <= 46; x++) {
    for (let y = 64; y <= 68; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'netherrack' && b.name !== 'nether_bricks' && b.name !== 'nether_brick_fence') {
        console.log(`Placed block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
