// programs/505-find-resources.js
console.log('=== Program 505: Find Trees and Stone ===');
const logs = bot.findBlocks({
  matching: b => b && b.name.endsWith('_log'),
  maxDistance: 32,
  count: 5
});
console.log(`Found ${logs.length} logs nearby:`);
for (const l of logs) {
  console.log(`  ${bot.blockAt(l).name} at ${lib.fmt(l)} (dist ${bot.entity.position.distanceTo(l).toFixed(1)}m)`);
}

const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'cobblestone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 32,
  count: 5
});
console.log(`Found ${stones.length} stone/cobble nearby:`);
for (const s of stones) {
  console.log(`  ${bot.blockAt(s).name} at ${lib.fmt(s)} (dist ${bot.entity.position.distanceTo(s).toFixed(1)}m)`);
}
