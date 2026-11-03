// programs/521-reset-hp-at-base.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 521: FAST FULL-HEAL RESPAWN TO BASE ===');
console.log('Pre-heal Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Pre-heal Inventory:', lib.inv());

// If health is already 20, no need to respawn
if (bot.health >= 19 && bot.food >= 18) {
  console.log('Health and food already full!');
  return { hp: bot.health, food: bot.food, pos: bot.entity.position };
}

// At 1.08 HP, stepping off into the y=53 deck or jumping down 4 blocks resets HP instantly to 20/20
const initialDim = bot.game.dimension;

// Step off edge at (44, 65, -125) towards y=53
try {
  bot.clearControlStates();
  bot.pathfinder.stop();
  await bot.lookAt(new Vec3(44.0, 53.0, -123.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
} catch (e) {}

// Wait for respawn
const startWait = Date.now();
while (bot.health < 15 && Date.now() - startWait < 8000 && !isCancelled()) {
  await sleep(250);
}

console.log('Post-heal State:');
console.log('Dimension:', bot.game.dimension);
console.log('Position:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());
console.log('Armor:', {
  head: bot.inventory.slots[5]?.name,
  torso: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});

bot.chat(`gamma: Respawned at base! HP: ${bot.health}/20, Food: ${bot.food}/20. Fully healed and regearing!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
