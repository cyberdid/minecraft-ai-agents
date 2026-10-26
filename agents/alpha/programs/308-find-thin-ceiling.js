// programs/308-find-thin-ceiling.js
console.log('=== Program 308: Search for Cavern Ceiling ===');

for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const x = 336 + dx;
    const z = -70 + dz;
    // Find the highest air below y=21
    let highestAir = -1;
    for (let y = 20; y >= 5; y--) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        highestAir = y;
        break;
      }
    }
    if (highestAir !== -1) {
      console.log(`(${x}, ${z}): highest air below y=21 is at y=${highestAir} (stone thickness = ${21 - highestAir} blocks)`);
    }
  }
}

// Check Delta and Beta
if (bot.players.delta?.entity) console.log('Delta pos:', lib.fmt(bot.players.delta.entity.position));
if (bot.players.beta?.entity) console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position));
