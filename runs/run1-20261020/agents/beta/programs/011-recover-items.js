const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Recovering items from creeper blast!");

const deathPos = { x: 39.6, y: 77.6, z: -19.7 };
console.log('Navigating to death spot:', deathPos);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.maxDropDown = 4;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(deathPos.x, deathPos.y, deathPos.z, 1.5));
  console.log('Arrived near death spot.');
} catch (e) {
  console.log('Navigation message:', e.message);
}

// Collect all items nearby
console.log('Scanning for item drops within 12 blocks...');
const drops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 12);
console.log(`Found ${drops.length} item entity/entities.`);

for (const d of drops) {
  try {
    console.log(`Collecting item at ${d.position.floored()}...`);
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    await bot.waitForTicks(3);
  } catch (err) {}
}

await bot.waitForTicks(5);

const items = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Recovered inventory:', items || 'empty');

// Check time of day
console.log('Time of day:', bot.time.timeOfDay);

return { items };
