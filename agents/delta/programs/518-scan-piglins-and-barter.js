// programs/518-scan-piglins-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== COVERED TUNNEL TEAM & ENTITY SCAN ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health.toFixed(1)}, Food: ${bot.food}`);

// 1. Teammates check
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  } else {
    console.log(`Teammate ${name}: ${p ? 'online (entity not in range)' : 'offline'}`);
  }
}

// 2. Entities scan within 24m
const entities = Object.values(bot.entities).filter(e =>
  e && e !== bot.entity && bot.entity.position.distanceTo(e.position) <= 24
);

console.log(`Found ${entities.length} entities nearby:`);
for (const e of entities) {
  if (['piglin', 'piglin_brute', 'zombified_piglin', 'item', 'enderman', 'blaze', 'wither_skeleton'].includes(e.name)) {
    console.log(` - ${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m, id: ${e.id})`);
  }
}

// 3. Vacuum any dropped items (ender pearls, barter goods)
const droppedItems = Object.values(bot.entities).filter(e =>
  e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 6.0
);
if (droppedItems.length > 0) {
  console.log(`Found ${droppedItems.length} items within 6m, vacuuming...`);
  try { await lib.pickup(6.0); } catch (e) {}
}

console.log('Ender Pearls in Delta inventory:', lib.count('ender_pearl'));
console.log('Gold ingots in Delta inventory:', lib.count('gold_ingot'));

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls: lib.count('ender_pearl'),
  entities: entities.filter(e => ['piglin', 'item', 'enderman'].includes(e.name)).map(e => ({ name: e.name, pos: lib.fmt(e.position) }))
};
