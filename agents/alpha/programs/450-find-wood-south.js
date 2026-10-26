// programs/450-find-wood-south.js
console.log('=== Program 450: Find Wood & Stone Near Teammates ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// Check wood from current base pos
const logs = lib.find('*_log', { maxDistance: 64, count: 10 });
console.log(`Logs found from base: ${logs.length}`);
for (const l of logs) {
  console.log(`Log: ${l.name} at ${lib.fmt(l.position)} (dist ${(l.position.distanceTo(bot.entity.position)).toFixed(1)}m)`);
}

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
}
