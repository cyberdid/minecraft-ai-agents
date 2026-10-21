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

// 1. Target logs at Y >= 80
const targetPositions = [
  new Vec3(36, 80, -15),
  new Vec3(36, 81, -15),
  new Vec3(36, 82, -15),
  new Vec3(36, 80, -16),
  new Vec3(36, 81, -16)
];

for (const pos of targetPositions) {
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

// Collect drops
const drops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.y >= 79 && e.position.distanceTo(bot.entity.position) < 8);
for (const d of drops) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    await bot.waitForTicks(5);
  } catch (e) {}
}

console.log("Inventory after chop:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 2. Craft planks
await cleanSlots();
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const log of logs) {
  const plankName = log.name.replace('_log', '_planks');
  const recipe = bot.recipesFor(mcData.itemsByName[plankName].id, null, 1, null)[0];
  if (recipe) {
    await bot.craft(recipe, log.count, null);
    await cleanSlots();
  }
}

// 3. Craft crafting table
const tableRecipe = bot.recipesFor(mcData.itemsByName['crafting_table'].id, null, 1, null)[0];
if (tableRecipe) {
  await bot.craft(tableRecipe, 1, null);
  await cleanSlots();
}

// 4. Craft sticks (2 crafts = 8 sticks)
const stickRecipe = bot.recipesFor(mcData.itemsByName['stick'].id, null, 1, null)[0];
if (stickRecipe) {
  await bot.craft(stickRecipe, 2, null);
  await cleanSlots();
}

// 5. Place crafting table at feet
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
const feet = bot.entity.position.floored();
const groundBlock = bot.blockAt(feet.offset(1, -1, 0));
const placePos = feet.offset(1, 0, 0);

if (tableItem && groundBlock && groundBlock.name !== 'air') {
  console.log(`Placing crafting table on ${groundBlock.name}...`);
  await bot.equip(tableItem, 'hand');
  await bot.placeBlock(groundBlock, new Vec3(0, 1, 0));
  await bot.waitForTicks(10);

  const tableBlock = bot.blockAt(placePos);
  if (tableBlock && tableBlock.name === 'crafting_table') {
    // Craft sword
    const swordRec = bot.recipesFor(mcData.itemsByName['wooden_sword'].id, null, 1, tableBlock)[0];
    if (swordRec) {
      await bot.craft(swordRec, 1, tableBlock);
      console.log("Crafted wooden_sword!");
    }
    // Craft axe
    const axeRec = bot.recipesFor(mcData.itemsByName['wooden_axe'].id, null, 1, tableBlock)[0];
    if (axeRec) {
      await bot.craft(axeRec, 1, tableBlock);
      console.log("Crafted wooden_axe!");
    }
    // Craft pickaxe
    const pickRec = bot.recipesFor(mcData.itemsByName['wooden_pickaxe'].id, null, 1, tableBlock)[0];
    if (pickRec) {
      await bot.craft(pickRec, 1, tableBlock);
      console.log("Crafted wooden_pickaxe!");
    }

    // Retrieve table
    await bot.dig(tableBlock);
    await bot.waitForTicks(5);
  }
}

// Collect any drops from table
const tableDrops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 5);
for (const td of tableDrops) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(td.position.x, td.position.y, td.position.z, 0.5));
  } catch (e) {}
}

console.log("Equipped inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 6. Equip sword in hand
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// 7. Walk to Beta at cabin site (42, 77, -21)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allow1by1towers = true;
moves.maxDropDown = 2;
bot.pathfinder.setMovements(moves);

console.log("Walking to cabin site (42, 77, -21)...");
try {
  await bot.pathfinder.goto(new goals.GoalNear(42, 77, -21, 2));
  console.log("Joined Beta at cabin site!");
} catch (e) {
  console.log("Nav warning:", e.message);
}

bot.chat("I'm here with Beta at the cabin site with sword, axe, pickaxe, and planks!");
console.log("Final inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));
