// programs/527-retreat-to-base.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 527: RETREAT TO OVERWORLD BASE ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Keep shield raised facing blazes while retreating
bot.activateItem(true);
bot.chat('gamma: Initiating retreat from Spawner Pillbox through covered corridors to Overworld base!');

const res = await globalThis.retreatToOverworldBase();
console.log('Retreat result:', JSON.stringify(res));

console.log('Current State:');
console.log('Dimension:', bot.game.dimension);
console.log('Position:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

if (bot.game.dimension === 'overworld') {
  bot.chat(`gamma: Safely arrived in Overworld base! HP: ${bot.health}/20, Food: ${bot.food}/20.`);
} else {
  bot.chat(`gamma: At ${lib.fmt(bot.entity.position)} in ${bot.game.dimension}. HP: ${bot.health}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
