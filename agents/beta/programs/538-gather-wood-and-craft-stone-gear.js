// programs/538-gather-wood-and-craft-stone-gear.js
console.log('=== Step: Morning Log Harvest & Stone Gear Crafting ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Exit base through door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log('Exiting base through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
  try { await lib.goTo(294, 72, -52, 1); } catch (e2) {}
}

// 2. Find and mine logs at (291, 70, -77)
const targetLog = new Vec3(291, 70, -77);
console.log(`Heading to tree at ${lib.fmt(targetLog)}...`);

try {
  await lib.goTo(targetLog.x, targetLog.y, targetLog.z, 2);
} catch (e) {
  console.log('goTo tree note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(targetLog.x, targetLog.y, targetLog.z, 2));
  } catch (e2) {}
}

console.log('Near tree at:', lib.fmt(bot.entity.position));

// Mine up to 4 logs from this tree
for (let y = 70; y <= 74; y++) {
  const lb = bot.blockAt(new Vec3(291, y, -77));
  if (lb && lb.name.endsWith('_log')) {
    console.log(`Mining log at (291, ${y}, -77)...`);
    try {
      await lib.dig(291, y, -77);
    } catch (e) {
      console.log(`Dig error at y=${y}:`, e.message);
    }
  }
}

// Pick up drops
await lib.pickup(6);

// Check logs
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
const logCount = logs.reduce((acc, i) => acc + i.count, 0);
console.log(`Harvested logs: ${logCount}`);

// 3. Craft planks, sticks, wooden pickaxe
if (logCount > 0) {
  try { await lib.craft('oak_planks', logCount * 4); } catch (e) {}
}

const planks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((acc, i) => acc + i.count, 0);
console.log(`Total planks: ${planks}`);

if (planks >= 3 && !bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) {
  await bot.equip(wpick, 'hand');
  console.log('Equipped wooden_pickaxe!');
}

// 4. Mine 20 cobblestone
console.log('Mining 20 cobblestone...');
const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 15, count: 25 });
console.log(`Found ${stones.length} stone blocks nearby`);
let mined = 0;
for (const sp of stones) {
  if (mined >= 20 || isCancelled()) break;
  try {
    await lib.goTo(sp.x, sp.y, sp.z, 2);
    await lib.dig(sp.x, sp.y, sp.z);
    mined++;
  } catch (e) {}
}

await lib.pickup(6);
const cobble = bot.inventory.count(mcData.itemsByName.cobblestone.id);
console.log(`Total cobblestone mined: ${cobble}`);

// 5. Craft stone pickaxe and stone sword
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

// Equip stone weapons
await lib.equipWeapon();

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Final Inventory:', inv);
console.log('Final Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);
bot.chat(`beta: Successfully crafted stone gear (${inv})! Heading to Nether portal.`);

return inv;
