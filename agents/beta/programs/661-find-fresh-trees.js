const allLogs = lib.find('*_log', { maxDistance: 80, count: 50 });
console.log(`Total logs found: ${allLogs.length}`);

// Group logs by x, z column to find full tree trunks
const columns = {};
for (const l of allLogs) {
  const key = `${l.position.x},${l.position.z}`;
  if (!columns[key]) columns[key] = [];
  columns[key].push(l.position.y);
}

console.log('Tree trunks found:');
for (const [col, ys] of Object.entries(columns)) {
  ys.sort((a, b) => a - b);
  const [x, z] = col.split(',').map(Number);
  const dist = bot.entity.position.distanceTo(new Vec3(x, ys[0], z));
  console.log(`- Column (${col}): lowest y=${ys[0]}, highest y=${ys[ys.length - 1]}, count=${ys.length}, dist=${dist.toFixed(1)}m`);
}
