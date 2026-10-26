// programs/283-gather-wood-and-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Exit base through door
console.log('Exiting base through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Exited door, new pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door passage error (may already be outside):', e.message);
}

// 2. Collect 4 logs
console.log('Collecting 4 logs...');
await lib.collect('*_log', 4);
console.log('Logs collected! Current logs:', lib.count('*_log'));

// 3. Craft planks and sticks
const logType = bot.inventory.items().find(i => i.name.endsWith('_log'))?.name;
if (logType) {
  const plankName = logType.replace('_log', '_planks');
  await lib.craft(plankName, 12);
  console.log('Planks crafted:', lib.count('*_planks'));
}
await lib.craft('stick', 8);
console.log('Sticks crafted:', lib.count('stick'));

// 4. Craft wooden pickaxe
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted:', lib.count('wooden_pickaxe'));

// 5. Collect 24 cobblestone
console.log('Collecting 24 cobblestone...');
await lib.collect('cobblestone', 24);
console.log('Cobblestone collected:', lib.count('cobblestone'));

// 6. Craft stone pickaxe and stone sword
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);
console.log('Tools crafted! Stone pickaxe:', lib.count('stone_pickaxe'), 'Stone sword:', lib.count('stone_sword'));

// 7. Summary
console.log('Final inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
