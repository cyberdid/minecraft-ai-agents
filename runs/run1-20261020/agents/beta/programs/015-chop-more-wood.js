const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Equipping axe to gather more logs for the roof and door!");

const axe = bot.inventory.items().find(i => i.name.endsWith('_axe'));
if (axe) {
  await bot.equip(axe, 'hand');
  console.log('Equipped axe:', axe.name);
}

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allow1by1towers = true;
bot.pathfinder.setMovements(moves);

// Find logs within 16 blocks, above Y=75
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 16,
  count: 10
});

console.log(`Found ${logs.length} logs nearby.`);
let chopped = 0;
for (const l of logs) {
  if (isCancelled() || chopped >= 8) break;
  const block = bot.blockAt(l);
  if (!block || !block.name.endsWith('_log')) continue;
  console.log(`Chopping ${block.name} at ${l}...`);
  try {
    if (bot.entity.position.distanceTo(l) > 3.5) {
      await bot.pathfinder.goto(new goals.GoalNear(l.x, l.y, l.z, 2));
    }
    await bot.lookAt(l.offset(0.5, 0.5, 0.5));
    await bot.dig(block);
    chopped++;
    await bot.waitForTicks(3);
  } catch (err) {
    console.log(`Error chopping at ${l}:`, err.message);
  }
}

// Collect drops
const drops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
for (const d of drops) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    await bot.waitForTicks(2);
  } catch (e) {}
}

// Convert all logs to planks
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    console.log(`Crafting planks from ${item.count} ${item.name}...`);
    await bot.clickWindow(item.slot, 0, 0);
    await bot.waitForTicks(2);
    await bot.clickWindow(1, 0, 0);
    await bot.waitForTicks(2);
    await bot.clickWindow(0, 0, 1);
    await bot.waitForTicks(3);
    if (bot.inventory.slots[1]) await bot.putAway(1);
  }
}

const totalPlanks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((s, i) => s + i.count, 0);
console.log(`Total planks now: ${totalPlanks}`);

bot.chat(`Wood gathered! I now have ${totalPlanks} planks ready for walls, roof, and door.`);

return { chopped, totalPlanks };
