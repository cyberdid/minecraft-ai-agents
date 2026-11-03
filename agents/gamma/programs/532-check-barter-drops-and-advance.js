// programs/532-check-barter-drops-and-advance.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 532: CHECK DROPS & ADVANCE TO PIGLIN ON FLOOR ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check all dropped items within 16m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Found ${items.length} dropped items within 16m:`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)} (dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m)`);
}

// 2. If item is near (43, 68, -142), try to reach it
for (const it of items) {
  if (Math.abs(it.position.y - 68) <= 1.5) {
    console.log(`Item on upper ledge at ${lib.fmt(it.position)}! Attempting to reach...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 1.2));
    } catch (e) {
      console.log('Path to item note:', e.message);
    }
  }
}
await lib.pickup(5.0);

console.log('Inventory after pickup:', lib.inv());

// 3. Scan Piglins within 32m
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins within 32m (${piglins.length}):`);
for (const p of piglins) {
  const d = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  Piglin at ${lib.fmt(p.position)} (dist: ${d}m)`);
}

// 4. Advance forward along covered tunnel from (45, 65, -144) to (44, 65, -160)
console.log('Advancing along tunnel to (44, 65, -160)...');
try {
  await lib.goTo(44, 65, -155, 1.5, { dig: false, timeoutMs: 8000 });
} catch (e) {
  console.log('goTo -155 note:', e.message);
}

try {
  await lib.goTo(44, 65, -165, 1.5, { dig: false, timeoutMs: 8000 });
} catch (e) {
  console.log('goTo -165 note:', e.message);
}

console.log('Arrived at pos:', lib.fmt(bot.entity.position));

// 5. Check nearby Piglins at new position
const floorPiglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12
);
console.log(`Floor Piglins near (44, 65, -165) (${floorPiglins.length}):`);
for (const p of floorPiglins) {
  const d = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  Piglin at ${lib.fmt(p.position)} (dist: ${d}m)`);
}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  itemsCount: items.length,
  floorPiglinsCount: floorPiglins.length,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
