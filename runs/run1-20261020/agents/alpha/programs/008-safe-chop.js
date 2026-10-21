const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data')(bot.version);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allow1by1towers = true;
moves.maxDropDown = 2;
bot.pathfinder.setMovements(moves);

console.log("Current position:", bot.entity.position);

function getSafeLogs() {
  const points = bot.findBlocks({
    matching: (b) => b && b.name && b.name.endsWith('_log'),
    maxDistance: 16,
    count: 20
  });
  return points.filter(p => p.y >= 78);
}

const safeLogs = getSafeLogs();
console.log(`Found ${safeLogs.length} safe logs:`);
for (const l of safeLogs.slice(0, 5)) {
  console.log(`- ${bot.blockAt(l)?.name} at ${l}`);
}

async function safeChop(targetCount = 6) {
  let chopped = 0;
  for (let i = 0; i < 15 && chopped < targetCount && !isCancelled(); i++) {
    // Check threats
    const hostiles = Object.values(bot.entities).filter(e => {
      if (!e || !e.position) return false;
      const isHostile = ['zombie', 'skeleton', 'creeper', 'spider'].includes(e.name?.toLowerCase());
      return isHostile && e.position.distanceTo(bot.entity.position) < 8;
    });
    if (hostiles.length > 0) {
      console.log(`Warning: ${hostiles[0].name} nearby at dist ${hostiles[0].position.distanceTo(bot.entity.position).toFixed(1)}`);
      break;
    }

    const available = getSafeLogs();
    if (available.length === 0) break;
    available.sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position));
    const target = available[0];
    const block = bot.blockAt(target);

    console.log(`Heading to chop ${block ? block.name : 'block'} at ${target}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(target, bot.world));
    } catch (e) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 2));
      } catch (err) {
        console.log(`Cannot reach log at ${target}:`, err.message);
        continue;
      }
    }

    const blk = bot.blockAt(target);
    if (blk && blk.name.endsWith('_log')) {
      await bot.dig(blk);
      chopped++;
      console.log(`Chopped ${blk.name} (${chopped}/${targetCount})`);
      await bot.waitForTicks(5);
    }
  }

  // Pick up drops
  const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.y >= 78 && e.position.distanceTo(bot.entity.position) < 8);
  console.log(`Collecting ${drops.length} drop(s)...`);
  for (const d of drops) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
      await bot.waitForTicks(5);
    } catch (e) {}
  }
}

await safeChop(6);

// Clear crafting slots
for (let s = 1; s <= 4; s++) {
  if (bot.inventory.slots[s]) await bot.putAway(s);
}

// Craft planks
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const plankName = item.name.replace('_log', '_planks');
    const plankDef = mcData.itemsByName[plankName];
    if (plankDef) {
      const recipes = bot.recipesFor(plankDef.id, null, 1, null);
      if (recipes.length > 0) {
        try {
          await bot.craft(recipes[0], item.count, null);
          console.log(`Crafted ${plankName}`);
        } catch (e) {
          console.log(`Craft plank error: ${e.message}`);
        }
      }
    }
  }
}

// Craft crafting table
const tableDef = mcData.itemsByName['crafting_table'];
const tableRecipes = bot.recipesFor(tableDef.id, null, 1, null);
if (tableRecipes.length > 0) {
  try {
    await bot.craft(tableRecipes[0], 1, null);
    console.log("Crafted crafting_table!");
  } catch (e) {}
}

// Craft sticks
const stickDef = mcData.itemsByName['stick'];
const stickRecipes = bot.recipesFor(stickDef.id, null, 1, null);
if (stickRecipes.length > 0) {
  try {
    await bot.craft(stickRecipes[0], 2, null);
    console.log("Crafted sticks!");
  } catch (e) {}
}

for (let s = 1; s <= 4; s++) {
  if (bot.inventory.slots[s]) await bot.putAway(s);
}
console.log("Updated inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));
