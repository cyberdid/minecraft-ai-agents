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

// 1. Clean slots & craft 2 logs into 8 planks
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

// 2. Craft 2 planks into 4 sticks
const stickRecipe = bot.recipesFor(mcData.itemsByName['stick'].id, null, 1, null)[0];
if (stickRecipe) {
  console.log("Crafting sticks...");
  await bot.craft(stickRecipe, 1, null);
  await cleanSlots();
}

console.log("Pre-travel inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

bot.chat("On my way down to (40, 79, -21) with wood and crafting table!");

// 3. Navigate to (40, 79, -21)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allow1by1towers = true;
moves.maxDropDown = 3;
bot.pathfinder.setMovements(moves);

console.log("Navigating to (40, 79, -21)...");
try {
  await bot.pathfinder.goto(new goals.GoalNear(40, 79, -21, 2));
  console.log("Arrived at cabin site! Position:", bot.entity.position);
} catch (e) {
  console.log("Pathfinding note:", e.message);
}

// 4. Place crafting table
const feet = bot.entity.position.floored();
console.log("Feet at site:", feet);

// Find a solid ground block around feet where the block above is air
let refBlock = null;
let placePos = null;
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
  const groundP = feet.offset(dx, -1, dz);
  const gb = bot.blockAt(groundP);
  const ab = bot.blockAt(groundP.offset(0, 1, 0));
  if (gb && gb.name !== 'air' && gb.name !== 'water' && !gb.name.includes('leaves') &&
      ab && (ab.name === 'air' || ab.name === 'cave_air')) {
    refBlock = gb;
    placePos = groundP.offset(0, 1, 0);
    break;
  }
}

if (!refBlock) {
  // If no immediate ground block, search 3x3 at y = feet.y - 1
  for (let x = -2; x <= 2 && !refBlock; x++) {
    for (let z = -2; z <= 2 && !refBlock; z++) {
      const gp = feet.offset(x, -1, z);
      const gb = bot.blockAt(gp);
      const ab = bot.blockAt(gp.offset(0, 1, 0));
      if (gb && gb.name !== 'air' && ab && ab.name === 'air') {
        refBlock = gb;
        placePos = gp.offset(0, 1, 0);
      }
    }
  }
}

if (refBlock) {
  console.log(`Placing crafting table on ${refBlock.name} at ${refBlock.position}...`);
  const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
  if (tableItem) {
    await bot.equip(tableItem, 'hand');
    await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
    await bot.waitForTicks(10);

    const tableBlock = bot.blockAt(placePos);
    console.log(`Placed table at ${placePos}: ${tableBlock.name}`);

    // Craft tools at table
    const axeRec = bot.recipesFor(mcData.itemsByName['wooden_axe'].id, null, 1, tableBlock)[0];
    if (axeRec) {
      await bot.craft(axeRec, 1, tableBlock);
      console.log("Crafted wooden_axe!");
      await bot.waitForTicks(5);
    }

    const pickRec = bot.recipesFor(mcData.itemsByName['wooden_pickaxe'].id, null, 1, tableBlock)[0];
    if (pickRec) {
      await bot.craft(pickRec, 1, tableBlock);
      console.log("Crafted wooden_pickaxe!");
      await bot.waitForTicks(5);
    }

    const shovelRec = bot.recipesFor(mcData.itemsByName['wooden_shovel'].id, null, 1, tableBlock)[0];
    if (shovelRec) {
      await bot.craft(shovelRec, 1, tableBlock);
      console.log("Crafted wooden_shovel!");
      await bot.waitForTicks(5);
    }

    bot.chat("Crafting table placed and tools ready! Let's build.");
  }
} else {
  console.log("Could not find suitable ground block to place crafting table yet.");
}

console.log("Final inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));
