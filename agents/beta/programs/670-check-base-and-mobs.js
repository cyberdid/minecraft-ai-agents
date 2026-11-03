console.log('=== Base & Environment Check ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Check nearby animals
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  bot.entity.position.distanceTo(e.position) < 30
);
console.log(`Animals nearby (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// Check nearby ground-reachable trees
const trees = lib.find('*_log', { maxDistance: 35, count: 10 });
console.log(`Logs nearby (${trees.length}):`);
for (const l of trees) {
  console.log(`  ${l.name} at ${l.position}, dist=${bot.entity.position.distanceTo(l.position).toFixed(1)}m`);
}
