console.log('=== DELTA: STATUS SCAN & RADAR ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Dimension: ${bot.game.dimension}`);

// 1. Players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Players nearby (${players.length}):`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// 2. Piglins and Endermen within 48m
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins within range (${piglins.length}):`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Endermen within range (${endermen.length}):`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 3. Blazes within range
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.isValid);
console.log(`Blazes within range: ${blazes.length}`);

// 4. Ground items within 24m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 24);
console.log(`Ground items nearby (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}: dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 5. Blocks: Chests / Crafting Tables
const chests = bot.findBlocks({ matching: b => b && b.name.includes('chest'), maxDistance: 32, count: 5 });
console.log(`Chests nearby: ${chests.length}`);
for (const c of chests) {
  console.log(`  Chest at ${lib.fmt(c)}`);
}

return {
  players: players.map(p => ({ name: p.username, pos: p.position })),
  piglins: piglins.length,
  endermen: endermen.length,
  pearls: lib.count('ender_pearl'),
  gold: lib.count('gold_ingot')
};
