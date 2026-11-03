// programs/799-check-team-and-chat.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Teammates
for (const p of Object.values(bot.players)) {
  if (p.username === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${p.username}: at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  } else {
    console.log(`Teammate ${p.username}: not rendered`);
  }
}
