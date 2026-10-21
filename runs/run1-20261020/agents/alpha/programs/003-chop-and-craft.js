bot.chat("Sounds great! Let's build at (40, 79, -21). I'll gather wood and craft tools.");

const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data')(bot.version);
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allow1by1towers = true;
bot.pathfinder.setMovements(moves);

async function chopLogs(targetCount = 6) {
  let chopped = 0;
  for (let attempt = 0; attempt < 15 && chopped < targetCount && !isCancelled(); attempt++) {
    const logs = bot.findBlocks({
      matching: (block) => block && block.name && block.name.endsWith('_log'),
      maxDistance: 16,
      count: 10
    });
    if (!logs || logs.length === 0) {
      console.log("No logs found within 16 blocks.");
      break;
    }
    logs.sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position));
    const target = logs[0];
    const block = bot.blockAt(target);
    console.log(`[${chopped + 1}/${targetCount}] Moving to ${block.name} at ${target}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(target, bot.world));
    } catch (e) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 2));
      } catch (err) {
        console.log(`Cannot navigate to log at ${target}:`, err.message);
        continue;
      }
    }

    const currentBlock = bot.blockAt(target);
    if (currentBlock && currentBlock.name.endsWith('_log')) {
      console.log(`Digging ${currentBlock.name}...`);
      await bot.dig(currentBlock);
      chopped++;
      await bot.waitForTicks(5);
    }
  }

  // Collect dropped items
  const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 10);
  console.log(`Found ${drops.length} drop(s) nearby. Collecting...`);
  for (const drop of drops) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(drop.position.x, drop.position.y, drop.position.z, 0.5));
      await bot.waitForTicks(5);
    } catch (err) {
      console.log("Failed to walk to drop:", err.message);
    }
  }
}

await chopLogs(6);

// Now let's craft planks from logs
console.log("Checking inventory after chopping...");
const logItems = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const logItem of logItems) {
  const plankName = logItem.name.replace('_log', '_planks');
  const plankDef = mcData.itemsByName[plankName];
  if (plankDef) {
    const recipes = bot.recipesFor(plankDef.id, null, 1, null);
    if (recipes.length > 0) {
      console.log(`Crafting planks from ${logItem.name} (count: ${logItem.count})...`);
      try {
        await bot.craft(recipes[0], logItem.count, null);
        console.log(`Successfully crafted ${plankName}`);
      } catch (e) {
        console.log(`Failed to craft ${plankName}:`, e.message);
      }
    }
  }
}

// Craft a crafting table if we don't have one
const tableDef = mcData.itemsByName['crafting_table'];
const hasTable = bot.inventory.items().some(i => i.name === 'crafting_table');
if (!hasTable && tableDef) {
  const tableRecipes = bot.recipesFor(tableDef.id, null, 1, null);
  if (tableRecipes.length > 0) {
    console.log("Crafting crafting_table...");
    try {
      await bot.craft(tableRecipes[0], 1, null);
      console.log("Crafted crafting_table!");
    } catch (e) {
      console.log("Failed to craft crafting_table:", e.message);
    }
  }
}
