// programs/513-check-teammates-and-plan.js
console.log('=== GAMMA: TEAM COORDINATION & MILESTONE 9 PLAN ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan for all players within 128m
const allPlayers = Object.values(bot.entities).filter(e =>
  e.type === 'player' && e.username !== bot.username
);

console.log(`Detected ${allPlayers.length} teammates in range:`);
for (const p of allPlayers) {
  const dist = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`- ${p.username}: ${lib.fmt(p.position)} (dist: ${dist}m)`);
}

// 2. Scan for Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  (e.name === 'piglin' || e.name === 'piglin_brute') && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Piglins within 32m: ${piglins.length}`);
for (const p of piglins) {
  console.log(`- ${p.name} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 3. Scan for dropped items within 16m
const items = Object.values(bot.entities).filter(e =>
  e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Dropped items within 16m: ${items.length}`);
for (const it of items) {
  console.log(`- item at ${lib.fmt(it.position)}`);
}

// 4. Chat coordination
bot.chat(`gamma: Bunker (44, 65, -128) secure. Golden boots worn. Ingots: ${lib.count('gold_ingot')}. Let's pool gold to barter for 12 Ender Pearls!`);

return {
  teammates: allPlayers.map(p => ({ username: p.username, pos: p.position, dist: bot.entity.position.distanceTo(p.position) })),
  piglins: piglins.map(p => ({ name: p.name, pos: p.position })),
  itemsCount: items.length,
  hp: bot.health,
  food: bot.food,
  ingots: lib.count('gold_ingot'),
  pearls: lib.count('ender_pearl')
};
