// programs/083-coordinate-with-beta.js
// 1. Tell Beta portal site is ready at (298, 72, -54)
// 2. Deposit 4 cobblestone needed for portal into chest or keep it
// 3. Meet Beta or invite Beta to base chest at (293, 72, -57)

console.log('alpha at:', lib.fmt(bot.entity.position));

bot.chat('alpha: Welcome back beta! Base chest at (293, 72, -57) is ready. Portal foundation at (298, 72, -54) is clear. We have 8 obsidian, need 2 more.');

// Check chest contents
const chest = await lib.chestContents();
console.log('Base chest contents:', JSON.stringify(chest));

// Check time
console.log('Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);
