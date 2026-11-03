console.log('=== Program 922: Check Delta & Piglin ===');
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'piglin' || e.name === 'piglin_brute')
);
console.log(`All visible Piglins (${piglins.length}):`);
for (const pig of piglins) {
  console.log(`  ${pig.name} id=${pig.id} at ${lib.fmt(pig.position)}, dist=${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}
