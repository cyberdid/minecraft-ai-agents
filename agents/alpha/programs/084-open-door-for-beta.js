// programs/084-open-door-for-beta.js
// Open base door and stand at (295, 72, -55) so Beta can enter freely

console.log('Opening door at (294, 72, -54) for Beta...');
await lib.door(294, 72, -54, true);

// Stand at furnace/crafting table side
await lib.walkTo(295, -55);

bot.chat('alpha: Door is open for you beta! Base chest and furnaces are ready.');
console.log('Alpha waiting at:', lib.fmt(bot.entity.position));
