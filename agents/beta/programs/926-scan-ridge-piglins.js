console.log('=== Program 926: Scan Ridge Piglins ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'piglin' || e.name === 'piglin_brute') && bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Piglins within 24m (${piglins.length}):`);
for (const p of piglins) {
  const dist = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  Piglin id=${p.id} at ${lib.fmt(p.position)}, dist=${dist}m`);
}
