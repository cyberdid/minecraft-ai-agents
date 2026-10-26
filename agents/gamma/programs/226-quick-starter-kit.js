// programs/226-quick-starter-kit.js
console.log('=== QUICK STARTER KIT: 4 LOGS -> STONE TOOLS ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time until night:', lib.time().secondsUntilNight);

// 1. Step outside base door
console.log('Exiting door...');
await lib.goThroughDoor(294, 72, -54);

// 2. Collect only 4 logs from ground level
console.log('Collecting 4 logs...');
const gotLogs = await lib.collect('*_log', 4);
console.log('Logs collected:', JSON.stringify(gotLogs));

// 3. Return to crafting table inside base
console.log('Entering base...');
await lib.goThroughDoor(294, 72, -54);

// 4. Craft planks and wooden pickaxe
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (!logType) throw new Error('No logs collected!');
const plankType = logType.replace('_log', '_planks');

console.log(`Crafting ${plankType}...`);
await lib.craft(plankType, 16);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 5. Exit door to mine stone
console.log('Exiting to mine stone...');
await lib.goThroughDoor(294, 72, -54);

// Mine 16 stone
console.log('Collecting 16 stone...');
await lib.collect('stone', 16);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 6. Return inside base before night
console.log('Returning inside base...');
await lib.goThroughDoor(294, 72, -54);
await lib.door(294, 72, -54, false); // close door

// 7. Craft stone tools at crafting table (295, 72, -56)
console.log('Crafting stone tools...');
if (lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);
await lib.equipWeapon();

// Set spawn
try { await lib.setSpawn(); } catch (e) {}

console.log('=== RESULT ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);

bot.chat(`gamma kit ready: stone pickaxe, sword, axe, cobble x${lib.count('cobblestone')}, planks x${lib.count('*_planks')}`);
