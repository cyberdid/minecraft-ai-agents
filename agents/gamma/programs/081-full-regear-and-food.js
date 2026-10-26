// programs/081-full-regear-and-food.js
console.log('--- SYSTEMATIC RE-GEAR & FOOD ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step outside base
console.log('Exiting base door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);

// 2. Gather 8 logs
console.log('Collecting 8 logs...');
const logs = await lib.collect('*_log', 8);
console.log('Logs collected:', JSON.stringify(logs));

// 3. Craft planks & sticks
const logType = Object.keys(logs)[0] || 'birch_log';
const plankType = logType.replace('_log', '_planks');
await lib.craft(plankType, 20);
await lib.craft('stick', 12);

// 4. Wooden pickaxe & stone mining
console.log('Crafting wooden_pickaxe...');
await lib.craft('wooden_pickaxe', 1);

console.log('Mining 16 stone for cobblestone...');
await lib.collect('stone', 16);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 5. Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_axe', 1);
await lib.craft('stone_sword', 1);

// 6. Gather 32 dirt for scaffolding / barriers
console.log('Gathering 24 dirt for barriers...');
try {
  await lib.collect('dirt', 24);
} catch (e) {
  console.log('Dirt note:', e.message);
}

// 7. Step back into base
console.log('Returning inside base...');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma fully re-geared at base: tools=${JSON.stringify(lib.tools())}, blocks=${lib.count('dirt') + lib.count('cobblestone')}`);
