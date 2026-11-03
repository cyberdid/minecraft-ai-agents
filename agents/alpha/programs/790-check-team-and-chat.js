// programs/790-check-team-and-chat.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Teammates positions
const players = Object.values(bot.players).filter(p => p.username !== bot.username);
for (const p of players) {
  if (p.entity) {
    console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  } else {
    console.log(`Teammate ${p.username}: entity not in render distance`);
  }
}

// Hostiles nearby
const hostiles = lib.hostiles(20);
console.log(`Hostiles nearby: ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`- ${h.name} at ${lib.fmt(h.position)} dist=${h.dist.toFixed(1)}`);
}

// Check nearby chests or crafting tables
const tables = bot.findBlocks({ matching: b => b && b.name === 'crafting_table', maxDistance: 16, count: 5 });
console.log(`Crafting tables nearby: ${tables.length}`);
for (const t of tables) {
  console.log(`- table at ${lib.fmt(t)}`);
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
