console.log('=== INSPECT PATH AHEAD (z = -2 to -10) ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

for (let z = -2; z >= -10; z--) {
  for (let y = 64; y <= 67; y++) {
    for (let x = 62; x <= 64; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'netherrack') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// Check what is directly in front of Delta in direction of -Z
for (let dz = 1; dz <= 5; dz++) {
  const checkZ = Math.round(bot.entity.position.z) - dz;
  const feet = bot.blockAt(new Vec3(Math.round(bot.entity.position.x), 65, checkZ));
  const head = bot.blockAt(new Vec3(Math.round(bot.entity.position.x), 66, checkZ));
  const floor = bot.blockAt(new Vec3(Math.round(bot.entity.position.x), 64, checkZ));
  console.log(`At z=${checkZ}: floor=${floor ? floor.name : 'null'}, feet=${feet ? feet.name : 'null'}, head=${head ? head.name : 'null'}`);
}
