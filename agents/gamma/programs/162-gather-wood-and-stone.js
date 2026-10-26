// programs/162-gather-wood-and-stone.js
console.log('--- GATHER WOOD & STONE FOR TOOLS & EXPEDITION ---');
console.log('Pos at start:', lib.fmt(bot.entity.position));
console.log('Time at start:', JSON.stringify(lib.time()));

// 1. Exit base through door (294, 72, -54)
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  console.log('Exiting through base door...');
  await lib.goThroughDoor(294, 72, -54);
} else {
  await lib.goTo(294, 72, -52, 1);
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Collect 8 logs
console.log('Collecting 8 logs...');
const logsGot = await lib.collect('*_log', 8);
console.log('Logs collected:', JSON.stringify(logsGot));
console.log('Inventory now:', JSON.stringify(lib.inv()));

// 3. Craft planks, sticks, wooden pickaxe
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (!logItem) throw new Error('No logs collected!');
const plankType = logItem.name.replace('_log', '_planks');
console.log(`Crafting ${plankType}...`);
await lib.craft(plankType, 24);
await lib.craft('stick', 12);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 4. Collect 24 stone (cobblestone)
console.log('Collecting 24 stone...');
const stoneGot = await lib.collect('stone', 24);
console.log('Stone collected:', JSON.stringify(stoneGot));

// 5. Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_pickaxe', 2);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);
await lib.equipWeapon();
console.log('Stone tools crafted! Equipped weapon.');

// 6. Collect 16 dirt for emergency shelters / towers
if (lib.count('dirt') < 16) {
  console.log('Collecting dirt...');
  await lib.collect('dirt', 16 - lib.count('dirt'));
}

// 7. Return to base
console.log('Returning to base at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);
await lib.goThroughDoor(294, 72, -54);
console.log('Safely inside base! Pos:', lib.fmt(bot.entity.position));

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Time at end:', JSON.stringify(lib.time()));

bot.chat(`gamma armed with stone sword, 2 stone pickaxes, stone axe, ${lib.count('cobblestone')} cobble, ${lib.count('dirt')} dirt! Inside base.`);
