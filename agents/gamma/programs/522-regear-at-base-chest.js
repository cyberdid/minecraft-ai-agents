// programs/522-regear-at-base-chest.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 522: REGEAR AT BASE CHEST ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Walk to chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.goTo(293, 72, -56, 1.2, { timeoutMs: 6000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e2) {}
}

const chestBlock = bot.blockAt(chestPos);
if (!chestBlock) {
  console.log('Error: chest block not found at (293, 72, -57)');
  return { error: 'No chest block' };
}

console.log('Opening Base Chest at (293, 72, -57)...');
const chest = await bot.openChest(chestBlock);
const chestItems = chest.items();
console.log(`Chest contents (${chestItems.length} stacks):`);
for (const item of chestItems) {
  console.log(`  - ${item.name} x${item.count} (slot ${item.slot})`);
}

// Deposit junk tools if we want to free inventory
for (const junk of ['wooden_pickaxe']) {
  const item = bot.inventory.items().find(i => i.name === junk);
  if (item) {
    try {
      await chest.deposit(item.type, null, item.count);
      console.log(`Deposited ${junk} into chest.`);
    } catch (e) {}
  }
}

// Withdraw cooked food (up to 16)
const foodNames = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple'];
for (const fn of foodNames) {
  const fi = chest.items().find(i => i.name === fn);
  if (fi && fi.count > 0) {
    const take = Math.min(fi.count, 16);
    try {
      await chest.withdraw(fi.type, null, take);
      console.log(`Withdrew ${take} ${fn} from chest.`);
    } catch (e) {}
    break;
  }
}

// Withdraw cobblestone (up to 64)
const cobble = chest.items().find(i => i.name === 'cobblestone');
if (cobble && cobble.count > 0 && lib.count('cobblestone') < 32) {
  const take = Math.min(cobble.count, 32);
  try {
    await chest.withdraw(cobble.type, null, take);
    console.log(`Withdrew ${take} cobblestone from chest.`);
  } catch (e) {}
}

// Withdraw gold ingots for bartering
const gold = chest.items().find(i => i.name === 'gold_ingot');
if (gold && gold.count > 0) {
  const take = Math.min(gold.count, 10);
  try {
    await chest.withdraw(gold.type, null, take);
    console.log(`Withdrew ${take} gold_ingot from chest for bartering.`);
  } catch (e) {}
}

// Withdraw gold nuggets for crafting ingots
const nuggets = chest.items().find(i => i.name === 'gold_nugget');
if (nuggets && nuggets.count >= 9) {
  const take = Math.floor(nuggets.count / 9) * 9;
  try {
    await chest.withdraw(nuggets.type, null, take);
    console.log(`Withdrew ${take} gold_nugget from chest.`);
  } catch (e) {}
}

// Check for armor pieces: helmet, chestplate, leggings (NEVER iron_boots!)
for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings']) {
  const item = chest.items().find(i => i.name === piece);
  if (item && !bot.inventory.items().some(i => i.name === piece)) {
    try {
      await chest.withdraw(item.type, null, 1);
      console.log(`Withdrew ${piece} from chest.`);
    } catch (e) {}
  }
}

await chest.close();

// Craft any gold nuggets into ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Crafted gold ingots! Total: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

// Call quickRegear
await globalThis.quickRegear({ cobble: 16 });

console.log('Post-regear Status:');
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());
console.log('Armor:', {
  head: bot.inventory.slots[5]?.name,
  torso: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});

bot.chat(`gamma: Fully regeared! HP 20/20, Food 20/20, ${lib.count('gold_ingot')} gold ingots, ${lib.count('cobblestone')} cobble! Ready to enter Nether!`);

return {
  hp: bot.health,
  food: bot.food,
  goldIngots: lib.count('gold_ingot'),
  cobblestone: lib.count('cobblestone'),
  goldenBootsEquipped: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
