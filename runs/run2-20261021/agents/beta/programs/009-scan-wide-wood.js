// Search for logs and leaves up to 256 blocks away
console.log('Searching for logs within 256 blocks...');
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 256,
  count: 10
}).filter(p => p.y >= 60);

console.log('Surface logs within 256:', logs.length);
if (logs.length > 0) {
  for (const l of logs.slice(0, 3)) {
    console.log('Found log at', lib.fmt(l), 'dist:', Math.round(bot.entity.position.distanceTo(l)));
  }
}

const leaves = bot.findBlocks({
  matching: b => b.name.endsWith('_leaves'),
  maxDistance: 256,
  count: 10
}).filter(p => p.y >= 60);

console.log('Surface leaves within 256:', leaves.length);
if (leaves.length > 0) {
  for (const lv of leaves.slice(0, 3)) {
    console.log('Found leaves at', lib.fmt(lv), 'dist:', Math.round(bot.entity.position.distanceTo(lv)));
  }
}

// Also check what biomes are around if possible, or check blocks far North/South/East/West
if (logs.length === 0 && leaves.length === 0) {
  console.log('Checking cardinal directions at dist 150...');
  const dirs = [
    { name: 'North', x: 0, z: -150 },
    { name: 'South', x: 0, z: 150 },
    { name: 'East', x: 150, z: 0 },
    { name: 'West', x: -150, z: 0 },
  ];
  for (const d of dirs) {
    const tx = Math.floor(bot.entity.position.x) + d.x;
    const tz = Math.floor(bot.entity.position.z) + d.z;
    // Check if chunk is loaded / block exists
    const b = bot.blockAt(new Vec3(tx, 64, tz));
    console.log(`Direction ${d.name} (${tx}, 64, ${tz}):`, b ? b.name : 'unloaded');
  }
}
