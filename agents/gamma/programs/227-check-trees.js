// programs/227-check-trees.js
console.log('=== CHECK TREES AND DROPS ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Find logs
const logs = lib.find('*_log', { maxDistance: 32, count: 10 });
console.log(`Logs found (${logs.length}):`);
for (const l of logs) {
  console.log(` - ${l.name} at ${lib.fmt(l.position)} dist=${bot.entity.position.distanceTo(l.position).toFixed(1)}m`);
}

// 2. Find dropped items within 32m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
console.log(`Items within 32m (${items.length}):`);
for (const it of items) {
  console.log(` - Item ${it.id} at ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 3. Time
console.log('Time:', JSON.stringify(lib.time()));
