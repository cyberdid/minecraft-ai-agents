// programs/121-check-tunnel-or-dig-route.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Check blocks along x=43..44, y=65..68, z=-130..-136
console.log('Inspecting North face of bunker towards Blaze Spawner:');
for (let z = -129; z >= -136; z--) {
  for (let x = 43; x <= 45; x++) {
    for (let y = 65; y <= 67; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// Check if Alpha has arrived in the Nether
console.log('Teammates check:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'delta') {
    const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
    console.log(`- ${name} at ${lib.fmt(p.entity.position)} (dist ${d}m)`);
  }
}
