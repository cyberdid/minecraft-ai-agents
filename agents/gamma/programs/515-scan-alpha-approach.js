// programs/515-scan-alpha-approach.js
console.log('=== GAMMA: SCAN APPROACH & TEAM COORDINATION ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan players within 64m
const players = Object.values(bot.entities).filter(e =>
  e.type === 'player' && e.username !== bot.username
);
console.log(`Players detected: ${players.length}`);
for (const p of players) {
  const dist = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${dist}m`);
}

// 2. Scan items within 16m
const items = Object.values(bot.entities).filter(e =>
  e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Dropped items within 16m: ${items.length}`);
for (const it of items) {
  console.log(`- item at ${lib.fmt(it.position)}`);
}

// 3. Scan Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  (e.name === 'piglin' || e.name === 'piglin_brute') && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Piglins within 32m: ${piglins.length}`);
for (const pig of piglins) {
  console.log(`- ${pig.name} at ${lib.fmt(pig.position)}, dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}

// 4. If any items dropped within 6m, vacuum them
if (items.length > 0) {
  const picked = await lib.pickup(6.0);
  console.log(`Vacuumed items: ${picked}`);
}

// 5. Check if we have food to eat
const foodItem = bot.inventory.items().find(i =>
  i.name.includes('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name === 'baked_potato' || i.name.includes('beef') || i.name.includes('porkchop') || i.name.includes('mutton')
);
if (foodItem) {
  try {
    await lib.eat();
    console.log(`Ate food! New Food: ${bot.food}, HP: ${bot.health}`);
  } catch (e) {}
}

return {
  players: players.map(p => ({ username: p.username, pos: p.position })),
  items: items.map(i => i.position),
  piglins: piglins.map(p => ({ name: p.name, pos: p.position })),
  hp: bot.health,
  food: bot.food,
  ingots: lib.count('gold_ingot'),
  pearls: lib.count('ender_pearl')
};
