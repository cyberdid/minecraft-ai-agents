// programs/314-prepare-full-cobble-loadout.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Exit base through door
console.log('Exiting base through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Exited door, new pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door passage note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 2. Obtain stone pickaxe (handles wood -> planks -> table -> wood pickaxe -> stone -> stone pickaxe)
console.log('Obtaining stone_pickaxe...');
await lib.obtain('stone_pickaxe', 1);
console.log('Have stone_pickaxe! Count:', lib.count('stone_pickaxe'));

// 3. Obtain stone sword
console.log('Obtaining stone_sword...');
await lib.obtain('stone_sword', 1);
console.log('Have stone_sword! Count:', lib.count('stone_sword'));

// 4. Obtain 48 cobblestone for heavy fortification
console.log('Obtaining 48 cobblestone...');
await lib.obtain('cobblestone', 48);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 5. Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

console.log('Full loadout ready! Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
bot.chat(`delta: Armed with stone sword & ${lib.count('cobblestone')} cobblestone! Ready for Nether fortification!`);
