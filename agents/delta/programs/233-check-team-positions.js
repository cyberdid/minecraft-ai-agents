// programs/233-check-team-positions.js
console.log('--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`${name}: pos ${lib.fmt(p.entity.position)}`);
  }
}

// Check newly placed floor blocks
for (let z = -163; z >= -175; z--) {
  for (let x = 40; x <= 46; x++) {
    const b = bot.blockAt(new Vec3(x, 64, z));
    if (b && b.name !== 'air' && b.name !== 'cave_air') {
      console.log(`Floor at (${x}, 64, ${z}): ${b.name}`);
    }
  }
}
