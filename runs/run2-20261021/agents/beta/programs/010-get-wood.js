bot.chat("alpha: Heading to trees at (133, 65, -114) for wood. Night in " + Math.round(lib.time().secondsUntilNight) + "s.");

console.log('Heading towards (133, 65, -114)...');
await lib.goTo(133, 65, -114, 10);
console.log('Reached tree area! Bot at:', lib.fmt(bot.entity.position));

// Search for logs now that we are close
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 32,
  count: 10
});
console.log('Logs found in range:', logs.length);

console.log('Collecting logs...');
const gotLogs = await lib.collect('*_log', 10);
console.log('Collected logs:', JSON.stringify(gotLogs));

// Craft planks
const logType = Object.keys(gotLogs).find(k => k.endsWith('_log')) || 'oak_log';
const plankType = logType.replace('_log', '_planks');
console.log(`Crafting ${plankType}...`);
await lib.craft(plankType, 24);

// Craft sticks and crafting table
console.log('Crafting sticks and table...');
await lib.craft('stick', 8);
await lib.craft('crafting_table', 1);

// Craft wooden pickaxe
console.log('Crafting wooden pickaxe...');
await lib.craft('wooden_pickaxe', 1);

console.log('Tools crafted! Inventory:', JSON.stringify(lib.inv()));

// Check for nearby exposed stone or surface stone to get cobblestone
const stone = bot.findBlocks({
  matching: b => b.name === 'stone',
  maxDistance: 32,
  count: 10
}).filter(p => p.y >= 58);

console.log('Surface stone found:', stone.length);
if (stone.length > 0) {
  console.log('Collecting stone with wooden pickaxe...');
  const gotStone = await lib.collect('stone', 14);
  console.log('Collected stone:', JSON.stringify(gotStone));
  
  // Craft stone tools
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_axe', 1);
  await lib.craft('stone_sword', 1);
  console.log('Stone tools crafted!');
}

return lib.status();
