// programs/623-find-all-chests-and-furnaces.js
console.log('=== Program 623: Find All Containers in Base ===');
const chests = bot.findBlocks({
  matching: b => b.name.includes('chest') || b.name.includes('barrel'),
  maxDistance: 16,
  count: 10
});
console.log('Chests/barrels found:', chests.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

const furnaces = bot.findBlocks({
  matching: b => b.name.includes('furnace'),
  maxDistance: 16,
  count: 10
});
console.log('Furnaces found:', furnaces.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));
