console.log('=== Program 928: Scan Dropped Items & Piglins ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

// 1. Scan dropped items within 12m
const items = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 12
);
console.log(`Dropped items within 12m (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}, dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 2. Scan Piglins within 8m
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'piglin' || e.name === 'piglin_brute') && bot.entity.position.distanceTo(e.position) <= 8
);
console.log(`Piglins within 8m (${piglins.length}):`);
for (const p of piglins) {
  console.log(`  Piglin id=${p.id} at ${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// Vacuum all items nearby
if (items.length > 0) {
  for (const it of items) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.5));
    } catch (e) {}
  }
}
await lib.pickup(6.0);

console.log('Inventory now:', JSON.stringify(lib.inv()));
