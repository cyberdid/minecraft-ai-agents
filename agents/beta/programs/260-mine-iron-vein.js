// programs/260-mine-iron-vein.js
console.log('=== Step 18: Mine iron vein at (304..308, y=52, -27..-34) ===');

// Check time
console.log('Starting pos:', lib.fmt(bot.entity.position), 'night in:', lib.time().secondsUntilNight);

// 1. Exit base door
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk to shaft entrance (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { timeoutMs: 20000 });

// 3. Find iron ores in loaded area
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 20
});
console.log(`Found ${ores.length} iron ores:`, ores.map(p => lib.fmt(p)));

// 4. Walk down towards the cluster at (304, 52, -34)
console.log('Navigating down shaft towards y=54...');
try {
  await lib.goTo(304, 54, -34, 3, { timeoutMs: 30000, dig: true });
  console.log('Reached lower vein level! Beta at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Path to lower vein note:', e.message);
}

// Place a torch
try {
  await lib.placeTorch();
} catch (e) {}

// Collect iron ores
console.log('Collecting iron ore blocks...');
try {
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  const got = await lib.collect(['iron_ore', 'deepslate_iron_ore'], 8);
  console.log('Collected iron:', JSON.stringify(got));
} catch (e) {
  console.log('Collect error:', e.message);
}

// 5. Return to surface base
console.log('Ascending back to base...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 35000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Ascent note:', e.message);
}

console.log('Beta inv now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Returned from iron vein with raw_iron: ${lib.count('raw_iron')}. Total iron on beta: ${lib.count('raw_iron') + lib.count('iron_ingot')}.`);
