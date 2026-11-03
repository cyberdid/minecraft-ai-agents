console.log('=== PROGRAM 696: RETREAT TO OVERWORLD BASE ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: 9 Blaze Rods secured by team! Retreating to Overworld Base via retreatToOverworldBase()!');

// 1. Equip shield and golden boots for march
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Execute retreatToOverworldBase helper
console.log('Executing retreatToOverworldBase()...');
try {
  const retreatRes = await globalThis.retreatToOverworldBase();
  console.log('retreatToOverworldBase returned:', JSON.stringify(retreatRes));
} catch (err) {
  console.log('retreatToOverworldBase notice:', err.message);
}

// 3. If in Overworld, enter base house at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Pos:', lib.fmt(bot.entity.position));
  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      await lib.goToXZ(294, -53, { timeoutMs: 15000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }

  // Inside base
  console.log('Inside Base! Final pos:', lib.fmt(bot.entity.position));
  bot.chat(`delta: Reunited at Overworld Base! HP: ${bot.health}/20, Food: ${bot.food}/20. Ready for Stronghold expedition!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
