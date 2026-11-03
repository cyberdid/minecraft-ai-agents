console.log('=== DELTA: NETHER REUNION & RADAR SCAN ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}, dimension: ${bot.game.dimension}`);

// 1. Teammates
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates nearby (${players.length}):`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// 2. Endermen
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Endermen in Nether (${endermen.length}):`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 3. Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins in Nether (${piglins.length}):`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// 4. Ground items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 24);
console.log(`Ground items nearby (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)} (dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m)`);
}

// 5. Team pearl count
const pearls = lib.count('ender_pearl');
console.log(`Delta Ender Pearls: ${pearls}`);

return {
  pos: bot.entity.position,
  players: players.map(p => ({ name: p.username, pos: p.position })),
  endermen: endermen.length,
  piglins: piglins.length,
  pearls
};
