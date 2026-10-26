// programs/560-rearm-at-tree-and-portal.js
console.log('=== Step: Harvest Wood at (312, 68, -84), Craft Stone Gear, and Enter Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Exit base through door
const doorPos = new Vec3(294, 72, -54);
console.log('Exiting base through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside door at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goTo(294, 72, -52, 1); } catch (e2) {}
}

// 2. Walk to Alpha & Delta at (312, 68, -84)
const harvestTarget = new Vec3(312, 68, -84);
console.log(`Heading to harvest site at ${lib.fmt(harvestTarget)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(harvestTarget.x, harvestTarget.y, harvestTarget.z, 3));
  console.log(`Reached harvest site at: ${lib.fmt(bot.entity.position)}`);
} catch (e) {
  try { await lib.goTo(harvestTarget.x, harvestTarget.y, harvestTarget.z, 3, { dig: true }); } catch (e2) {}
}

// Pick up any dropped planks or logs from Delta
await lib.pickup(8);

// If no logs or planks, mine nearby log blocks
let logs = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
let planks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((a, b) => a + b.count, 0);

if (logs === 0 && planks < 4) {
  console.log('Mining 3 logs from nearest tree...');
  const treeLogs = bot.findBlocks({ matching: b => b.name.endsWith('_log'), maxDistance: 15, count: 5 });
  for (const lp of treeLogs) {
    if (bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0) >= 3) break;
    try {
      await lib.goTo(lp.x, lp.y, lp.z, 2);
      await lib.dig(lp.x, lp.y, lp.z);
    } catch (e) {}
  }
  await lib.pickup(6);
}

// 3. Craft planks, sticks, wooden pickaxe
const totalLogs = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
if (totalLogs > 0) {
  try { await lib.craft('*_planks', totalLogs * 4); } catch (e) {}
  try { await lib.craft('stick', 4); } catch (e) {}
}

if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) await bot.equip(wpick, 'hand');

// 4. Mine 18 cobblestone
console.log('Mining 18 cobblestone...');
const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 12, count: 20 });
let m = 0;
for (const sp of stones) {
  if (m >= 18 || isCancelled()) break;
  try {
    await lib.goTo(sp.x, sp.y, sp.z, 2);
    await lib.dig(sp.x, sp.y, sp.z);
    m++;
  } catch (e) {}
}
await lib.pickup(6);

// 5. Craft stone pickaxe and stone sword
try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
try { await lib.craft('stone_sword', 1); } catch (e) {}

// Equip stone weapons
await lib.equipWeapon();

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Armed inventory:', inv);

// 6. Walk to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Walking to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1.0, { dig: true });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(portalPos.x, portalPos.y, portalPos.z, 1)); } catch (e2) {}
}

// Step into nether_portal block
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 8, count: 5 });
if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into portal block at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y + 0.5, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
} else {
  try { await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 0.5); } catch (e) {}
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 7. Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`SUCCESS: ENTERED THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

console.log('End Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`beta: Re-armed (${inv}) and entering Nether to fortify Blaze Spawner approach!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inv
};
