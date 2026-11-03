// programs/528-check-base-team.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 528: CHECK BASE & TEAMMATES ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// List all players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name}: at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: not in render distance`);
  }
}

// Check Base Chest contents
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base Chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Inventory:', lib.inv());

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  dim: bot.game.dimension,
  inv: lib.inv()
};
