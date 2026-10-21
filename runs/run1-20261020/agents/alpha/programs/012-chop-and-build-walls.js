const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data')(bot.version);
const { Vec3 } = require('vec3');

async function cleanSlots() {
  for (let s = 1; s <= 4; s++) {
    if (bot.inventory.slots[s]) {
      try { await bot.putAway(s); } catch (e) {}
    }
  }
}

// 1. Chop nearby logs
const targetLogs = [
  new Vec3(36, 79, -16),
  new Vec3(36, 79, -15),
  new Vec3(35, 79, -16),
  new Vec3(35, 79, -15)
];

for (const pos of targetLogs) {
  if (isCancelled()) break;
  const blk = bot.blockAt(pos);
  if (blk && blk.name.endsWith('_log')) {
    console.log(`Digging ${blk.name} at ${pos}...`);
    try {
      await bot.lookAt(pos.offset(0.5, 0.5, 0.5));
      await bot.dig(blk);
      console.log(`Chopped!`);
      await bot.waitForTicks(5);
    } catch (e) {
      console.log(`Dig error at ${pos}:`, e.message);
    }
  }
}

// Pick up drops
const drops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
for (const d of drops) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    await bot.waitForTicks(5);
  } catch (e) {}
}

console.log("Inventory after chopping:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 2. Craft all logs into planks
await cleanSlots();
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const log of logs) {
  const plankName = log.name.replace('_log', '_planks');
  const recipe = bot.recipesFor(mcData.itemsByName[plankName].id, null, 1, null)[0];
  if (recipe) {
    console.log(`Crafting ${plankName} from ${log.name}...`);
    await bot.craft(recipe, log.count, null);
    await cleanSlots();
  }
}

console.log("Planks in inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));
