// programs/703-check-gamma-and-trade.js
console.log('Alpha at:', lib.fmt(bot.entity.position));
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}
