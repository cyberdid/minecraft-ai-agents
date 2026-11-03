console.log('=== DELTA: PORTAL CAMP SCAN & TEAM STATUS ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// 1. Teammates
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Players nearby (${players.length}):`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// 2. Hostiles / Neutrals within 32m
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Endermen within 32m (${endermen.length}):`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins within 32m (${piglins.length}):`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// 3. Portal Blocks
const portalBlocks = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 16,
  count: 10
});
console.log(`Portal blocks (${portalBlocks.length}):`);
for (const pb of portalBlocks) {
  console.log(`  Portal block at ${lib.fmt(pb)}`);
}

// 4. Ground items within 16m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Items on ground (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}: dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  players: players.map(p => ({ name: p.username, pos: p.position })),
  endermen: endermen.length,
  piglins: piglins.length,
  portals: portalBlocks.length
};
