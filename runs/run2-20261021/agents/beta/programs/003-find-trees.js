// Find surface trees
const nearbyLogs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 64,
  count: 20
});

console.log('All logs found within 64 blocks:', nearbyLogs.length);
const surfaceLogs = nearbyLogs.filter(p => p.y >= 60);
console.log('Surface logs (y >= 60):', surfaceLogs.length);
if (surfaceLogs.length > 0) {
  console.log('Nearest surface log:', lib.fmt(surfaceLogs[0]));
} else {
  // Check leaves
  const leaves = bot.findBlocks({
    matching: b => b.name.endsWith('_leaves'),
    maxDistance: 64,
    count: 10
  }).filter(p => p.y >= 60);
  console.log('Surface leaves found:', leaves.length);
  if (leaves.length > 0) {
    console.log('Nearest leaves:', lib.fmt(leaves[0]));
  }
}

// Check team notes as well
