// programs/507-gather-gear.js
console.log('=== Program 507: Gather Wood, Stone & Tools ===');

// 1. Exit through door
console.log('Exiting base...');
await passDoorOut();
console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Walk to birch tree area at (267, 71, -55)
console.log('Walking towards birch trees at (270, 72, -55)...');
await lib.goToXZ(270, -55);
console.log('Arrived at:', lib.fmt(bot.entity.position));

// 3. Find and collect 4-5 logs
const targetLogs = bot.findBlocks({
  matching: b => b && b.name.endsWith('_log'),
  maxDistance: 16,
  count: 6
});
console.log(`Found ${targetLogs.length} logs in reach.`);
let gatheredLogs = 0;
for (const lPos of targetLogs) {
  if (gatheredLogs >= 4) break;
  try {
    console.log(`Mining log at ${lib.fmt(lPos)}...`);
    await lib.dig(lPos.x, lPos.y, lPos.z);
    await lib.pickup(4);
    gatheredLogs++;
  } catch (err) {
    console.log(`Failed to mine log at ${lib.fmt(lPos)}: ${err.message}`);
  }
}
console.log('Inventory after logs:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 4. Craft planks and sticks and wooden pickaxe
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  await lib.craft('birch_planks', 8);
}
if (lib.count('*_planks') < 4) {
  console.log('Warning: low on planks!');
}
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Crafted wooden pickaxe! Inventory:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 5. Mine stone on hillside (x <= 275 to stay far away from base house!)
console.log('Searching for stone blocks at x <= 275...');
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite') && b.position.x <= 275 && b.position.y <= 75,
  maxDistance: 16,
  count: 25
});
console.log(`Found ${stoneBlocks.length} stone blocks.`);
let minedCobble = 0;
for (const sPos of stoneBlocks) {
  if (minedCobble >= 20) break;
  try {
    await lib.dig(sPos.x, sPos.y, sPos.z);
    await lib.pickup(3);
    minedCobble++;
  } catch (err) {
    // ignore individual failures
  }
}
console.log(`Mined ${minedCobble} stone. Cobblestone count:`, lib.count('cobblestone'));

// 6. Craft stone tools: stone pickaxe, 2 stone swords
if (lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 2);

console.log('Inventory after crafting:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 7. Check for surface iron ore nearby
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 48,
  count: 5
});
console.log(`Found ${ironOres.length} iron ore blocks in 48m.`);
for (const ip of ironOres) {
  console.log(`  iron ore at ${lib.fmt(ip)} (dist ${bot.entity.position.distanceTo(ip).toFixed(1)}m)`);
}
