console.log('=== DELTA: SCAN FORTRESS CORRIDOR & TEAM ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// 1. Teammates
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates nearby (${players.length}):`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// 2. Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Piglins within 32m (${piglins.length}):`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m, id=${pig.id})`);
}

// 3. Endermen within 32m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Endermen within 32m: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 4. Ground items within 24m
const items = Object.values(bot.entities).filter(e =>
  e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Ground items nearby (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}: dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// Try pickup
try {
  const picked = await lib.pickup(8.0);
  console.log(`Picked up items: ${picked}`);
} catch (e) {}

const pearls = lib.count('ender_pearl');
console.log(`Delta Ender Pearls: ${pearls}/12`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls,
  gold: lib.count('gold_ingot'),
  piglins: piglins.map(p => ({ id: p.id, pos: p.position })),
  players: players.map(p => ({ name: p.username, pos: p.position }))
};
