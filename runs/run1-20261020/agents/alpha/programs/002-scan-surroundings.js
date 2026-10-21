// Check beta
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta is at ${beta.entity.position.floored()}, held: ${beta.entity.heldItem ? beta.entity.heldItem.name : 'nothing'}`);
} else {
  console.log('Beta entity not in render distance');
}

// Find nearby logs
const logs = globalThis.findLogs(15, 20);
console.log(`Found ${logs.length} logs nearby:`);
for (const l of logs) {
  const b = bot.blockAt(l);
  console.log(`- ${b.name} at ${l} (dist: ${l.distanceTo(bot.entity.position).toFixed(1)})`);
}

// Check terrain around (30, -21) to see if it's flat for building
console.log("Checking elevation around (30, -21)...");
const sampleCoords = [
  [30, -21], [35, -21], [40, -21],
  [30, -26], [35, -26], [40, -26],
  [30, -16], [35, -16], [40, -16]
];
for (const [x, z] of sampleCoords) {
  // scan Y from 95 down to 70 for highest non-air block
  for (let y = 95; y >= 70; y--) {
    const blk = bot.blockAt(bot.entity.position.clone().set(x, y, z));
    if (blk && blk.name !== 'air' && blk.name !== 'cave_air' && !blk.name.includes('leaves')) {
      console.log(`Terrain surface at (${x}, ${z}) is Y=${y} (${blk.name})`);
      break;
    }
  }
}
