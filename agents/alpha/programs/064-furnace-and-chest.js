// programs/064-furnace-and-chest.js
// 1. Craft furnace and place at (295, 72, -57)
// 2. Step outside, chop logs, craft chest, return inside, place at (293, 72, -57)

console.log('Starting furnace and chest setup. Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

// 1. Craft furnace (we have 147 cobblestone)
await lib.craft('furnace', 1);
console.log('Furnace crafted. Digging dirt at (295, 72, -57)...');
const dirtBlock = bot.blockAt(new Vec3(295, 72, -57));
if (dirtBlock && dirtBlock.name !== 'furnace') {
  await lib.dig(295, 72, -57);
}
await lib.place('furnace', 295, 72, -57);
console.log('Furnace 2 placed at (295, 72, -57)! Block is:', bot.blockAt(new Vec3(295, 72, -57)).name);

// 2. Step outside for wood
console.log('Stepping outside door at (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);

console.log('Collecting logs outside...');
const gotWood = await lib.collect('*_log', 4);
console.log('Collected wood:', JSON.stringify(gotWood));

await lib.craft('oak_planks', 16);
await lib.craft('chest', 1);
console.log('Chest crafted! Chest count:', lib.count('chest'));

// 3. Return inside and place chest
console.log('Returning inside base...');
await lib.goThroughDoor(294, 72, -54);

console.log('Placing chest at (293, 72, -57)...');
await lib.place('chest', 293, 72, -57);
console.log('Chest block at (293, 72, -57):', bot.blockAt(new Vec3(293, 72, -57)).name);

const chestItems = await lib.chestContents();
console.log('Chest contents verified:', JSON.stringify(chestItems));
bot.chat('alpha: Placed second furnace and base chest at (293, 72, -57).');
