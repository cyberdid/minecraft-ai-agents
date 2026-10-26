// programs/120-scout-high-ridge-to-blaze-spawner.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Scout terrain along high ridge towards Blaze Spawner at (32, 68, -190)
console.log('Scouting high ridge towards (32, 68, -190):');

// Check every 5 blocks along vector from (44, 66, -129) to (32, 68, -190)
for (let progress = 1; progress <= 8; progress++) {
  const fraction = progress / 8;
  const targetX = Math.round(44 + fraction * (32 - 44));
  const targetZ = Math.round(-129 + fraction * (-190 - -129));
  
  // Find top solid block at this (x, z) between y=50 and y=75
  let topSolidY = null;
  let topBlockName = 'none';
  for (let y = 75; y >= 50; y--) {
    const b = bot.blockAt(new Vec3(targetX, y, targetZ));
    if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'lava') {
      topSolidY = y;
      topBlockName = b.name;
      break;
    }
  }
  
  console.log(`Scan point ${progress} at (${targetX}, ~, ${targetZ}): top solid Y=${topSolidY} (${topBlockName})`);
}

// Check if any Blazes are loaded in entity list
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze');
console.log(`Loaded Blazes count: ${blazes.length}`);
for (const b of blazes) {
  const d = bot.entity.position.distanceTo(b.position);
  console.log(`- Blaze at ${lib.fmt(b.position)} dist ${d.toFixed(1)}m`);
}
