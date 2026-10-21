const alpha = bot.players.alpha?.entity;
console.log('Alpha position:', alpha ? lib.fmt(alpha.position) : 'unknown');

// Search for surface logs within 128 blocks
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 128,
  count: 10
}).filter(p => p.y >= 60);

console.log('Surface logs within 128 blocks:', logs.length);
if (logs.length > 0) {
  console.log('Closest log at:', lib.fmt(logs[0]));
  console.log('Moving to log and collecting 8 logs...');
  const got = await lib.collect('*_log', 8);
  console.log('Collected:', JSON.stringify(got));
} else {
  // Check leaves
  const leaves = bot.findBlocks({
    matching: b => b.name.endsWith('_leaves'),
    maxDistance: 128,
    count: 10
  }).filter(p => p.y >= 60);
  console.log('Surface leaves within 128 blocks:', leaves.length);
  if (leaves.length > 0) {
    console.log('Closest leaves at:', lib.fmt(leaves[0]));
    await lib.goTo(leaves[0].x, leaves[0].y, leaves[0].z, 3);
    const got = await lib.collect('*_log', 8);
    console.log('Collected:', JSON.stringify(got));
  } else {
    console.log('No trees or leaves found within 128 blocks of (-9, 62, -60).');
    // Explore further in the grass direction (North/West/East)
    // Check which direction has more grass blocks
    const grass = bot.findBlocks({
      matching: b => b.name === 'grass_block',
      maxDistance: 64,
      count: 50
    });
    if (grass.length > 0) {
      let avgX = 0, avgZ = 0;
      for (const g of grass) {
        avgX += g.x;
        avgZ += g.z;
      }
      avgX = Math.round(avgX / grass.length);
      avgZ = Math.round(avgZ / grass.length);
      console.log(`Grass center is around (${avgX}, ${avgZ}), exploring towards it`);
      await lib.goTo(avgX, bot.entity.position.y, avgZ, 5);
    }
  }
}

return lib.status();
