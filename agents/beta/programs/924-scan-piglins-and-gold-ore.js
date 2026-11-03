console.log('=== Program 924: Scan Piglins & Nether Gold Ore ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

// 1. Scan Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'piglin' || e.name === 'piglin_brute') && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Piglins within 32m (${piglins.length}):`);
for (const p of piglins) {
  const dist = bot.entity.position.distanceTo(p.position).toFixed(1);
  const dy = (p.position.y - bot.entity.position.y).toFixed(1);
  console.log(`  Piglin id=${p.id} at ${lib.fmt(p.position)} (dist: ${dist}m, dy: ${dy}m)`);
}

// 2. Scan nether_gold_ore within 32m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 32,
  count: 30
});
console.log(`Nether gold ore blocks within 32m (${ores.length}):`);
for (let i = 0; i < Math.min(10, ores.length); i++) {
  const op = ores[i];
  console.log(`  Ore at ${lib.fmt(op)} (dist: ${bot.entity.position.distanceTo(op).toFixed(1)}m)`);
}

// 3. Scan Endermen within 48m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 48
);
console.log(`Endermen within 48m (${endermen.length}):`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 4. Scan teammates
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}
