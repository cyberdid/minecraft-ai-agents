const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Skeleton is gone! Collecting remaining planks and tools on surface.");

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 3;
bot.pathfinder.setMovements(moves);

const drops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
console.log(`Collecting ${drops.length} drops within 8 blocks...`);

for (const d of drops) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    await bot.waitForTicks(3);
  } catch (err) {}
}

const items = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Current Inventory:', items);

return { items };
