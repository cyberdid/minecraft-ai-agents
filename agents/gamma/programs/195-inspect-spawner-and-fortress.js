// programs/195-inspect-spawner-and-fortress.js
console.log('--- INSPECT BLAZE SPAWNER AREA (32, 68, -190) ---');

// Check block at spawner
const spawner = bot.blockAt(new Vec3(32, 68, -190));
console.log('Block at (32, 68, -190):', spawner?.name);

// Find any spawners or nether_bricks within 64 blocks
const spawners = bot.findBlocks({
  matching: b => b.name === 'spawner',
  maxDistance: 64,
  count: 5
});
console.log(`Found ${spawners.length} spawners:`, spawners.map(p => `${lib.fmt(p)}: ${bot.blockAt(p)?.name}`));

const netherBricks = bot.findBlocks({
  matching: b => b.name.includes('nether_brick'),
  maxDistance: 64,
  count: 10
});
console.log(`Found ${netherBricks.length} nether_brick blocks nearby. Nearest:`);
for (const p of netherBricks.slice(0, 5)) {
  console.log(`  ${lib.fmt(p)}: ${bot.blockAt(p)?.name}`);
}

// Check where the bridge at x=44, z=-161 connects
console.log('Checking bridge end at z=-161..-165:');
for (let z = -160; z >= -165; z--) {
  for (let x = 43; x <= 45; x++) {
    const b = bot.blockAt(new Vec3(x, 64, z));
    if (b && b.name !== 'air') console.log(`  (${x}, 64, ${z}): ${b.name}`);
  }
}
