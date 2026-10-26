// programs/535-find-accessible-log-and-craft-tools.js
console.log('=== Step: Harvest Low Logs, Mine Stone, Craft Stone Tools ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
console.log('Current inv:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 1. Find accessible logs (y between 68 and 75)
let accessibleLogs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 50,
  count: 20
}).filter(p => p.y >= 68 && p.y <= 75);

console.log(`Found ${accessibleLogs.length} accessible log blocks (y <= 75)`);

// If none found nearby, explore towards (280, 72, -30) or (330, 70, -70)
if (accessibleLogs.length === 0) {
  console.log('Exploring for fresh trees towards forest...');
  try {
    await lib.goTo(280, 72, -30, 2);
  } catch (e) {
    try { await lib.goTo(320, 70, -70, 2); } catch (e2) {}
  }
  accessibleLogs = bot.findBlocks({
    matching: b => b.name.endsWith('_log'),
    maxDistance: 40,
    count: 20
  }).filter(p => p.y >= 68 && p.y <= 75);
  console.log(`After explore: found ${accessibleLogs.length} logs`);
}

// Mine 2-3 accessible logs
let minedLogs = 0;
for (const lp of accessibleLogs) {
  if (minedLogs >= 3 || isCancelled()) break;
  console.log(`Approaching log at ${lib.fmt(lp)}...`);
  try {
    await lib.goTo(lp.x, lp.y, lp.z, 2);
    await lib.dig(lp.x, lp.y, lp.z);
    minedLogs++;
    console.log(`Mined log at ${lib.fmt(lp)}!`);
  } catch (err) {
    console.log(`Could not mine log at ${lib.fmt(lp)}:`, err.message);
  }
}

// Pickup drops
await lib.pickup(6);

// 2. Craft planks, sticks, wooden pickaxe
const logItems = bot.inventory.items().filter(i => i.name.endsWith('_log'));
const totalLogs = logItems.reduce((acc, i) => acc + i.count, 0);
console.log(`Mined logs in inventory: ${totalLogs}`);

if (totalLogs > 0) {
  try { await lib.craft('oak_planks', totalLogs * 4); } catch (e) {}
}

const planks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((acc, i) => acc + i.count, 0);
console.log(`Total planks in inventory: ${planks}`);

if (planks >= 3) {
  if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
    try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
  }
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) {
  await bot.equip(wpick, 'hand');
  console.log('Equipped wooden_pickaxe!');
}

// 3. Mine 16-24 cobblestone
const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 15, count: 20 });
console.log(`Found ${stones.length} stone blocks nearby`);
let minedStone = 0;
for (const sp of stones) {
  if (minedStone >= 16 || isCancelled()) break;
  try {
    await lib.goTo(sp.x, sp.y, sp.z, 2);
    await lib.dig(sp.x, sp.y, sp.z);
    minedStone++;
  } catch (e) {}
}
await lib.pickup(6);

// 4. Craft stone pickaxe and stone sword
try {
  await lib.craft('stone_pickaxe', 1);
  console.log('SUCCESS: Crafted stone_pickaxe!');
} catch (e) {
  console.log('Stone pickaxe craft note:', e.message);
}

try {
  await lib.craft('stone_sword', 1);
  console.log('SUCCESS: Crafted stone_sword!');
} catch (e) {
  console.log('Stone sword craft note:', e.message);
}

// 5. Final report
const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Final Inventory:', inv);
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);
bot.chat(`beta: Re-armed with (${inv})! Heading to Nether portal.`);

return inv;
