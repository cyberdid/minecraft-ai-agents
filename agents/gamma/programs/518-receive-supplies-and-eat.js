// programs/518-receive-supplies-and-eat.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== GAMMA: RECEIVE SUPPLIES & HEAL ===');
console.log('Current Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: Gamma here at (44, 65, -127)! Please drop gold_ingot and any food here!');

const delta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'delta');
if (delta) {
  await bot.lookAt(delta.position.offset(0, 1.6, 0), true);
}

const startTime = Date.now();
while (Date.now() - startTime < 12000 && !isCancelled()) {
  await lib.pickup(4.0);
  
  // Try eating if food is low and we have food
  if (bot.food < 20) {
    try {
      await lib.eat();
      console.log('Ate food! Current Food:', bot.food, 'HP:', bot.health);
    } catch (e) {
      // No edible food yet
    }
  }
  await sleep(1000);
}

// Final pickup and check
await lib.pickup(4.0);

if (bot.food < 20) {
  try {
    await lib.eat();
  } catch (e) {}
}

const ingots = lib.count('gold_ingot');
const nuggets = lib.count('gold_nugget');
const pearls = lib.count('ender_pearl');

console.log(`Supplies check: ${ingots} gold_ingot, ${nuggets} gold_nugget, ${pearls} ender_pearl`);
console.log(`HP: ${bot.health}, Food: ${bot.food}`);
console.log('Inventory:', lib.inv());

bot.chat(`gamma: Current supplies: ${ingots} gold_ingot, ${pearls}/12 ender_pearl, HP: ${bot.health.toFixed(1)}, Food: ${bot.food}`);

return {
  ingots,
  nuggets,
  pearls,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
