console.log('Bot pos:', bot.entity.position);
const logs = lib.find('*_log', { maxDistance: 15, count: 10 });
console.log('Logs within 15m:');
for (const l of logs) {
  console.log(`  ${l.name} at ${l.position}, dist=${bot.entity.position.distanceTo(l.position).toFixed(1)}m`);
}

const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15);
console.log('Dropped items within 15m:', dropped.length);
for (const d of dropped) {
  console.log(`  Item: id=${d.id}, pos=${d.position}, dist=${bot.entity.position.distanceTo(d.position).toFixed(1)}m`);
}
