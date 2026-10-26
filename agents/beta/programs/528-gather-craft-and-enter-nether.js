// programs/528-gather-craft-and-enter-nether.js
console.log('=== Step: Gather Resources, Craft Stone Gear, and Enter Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);

// 1. Exit base shelter
const doorPos = new Vec3(294, 72, -54);
console.log('Exiting base shelter through door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
  try { await lib.goTo(294, 72, -52, 1); } catch (e2) {}
}

// 2. Collect 4 logs
console.log('Collecting 4 logs from nearby trees...');
try {
  await lib.collect('*_log', 4, 30);
  console.log('Logs collected! Logs count:', bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0));
} catch (e) {
  console.log('Error collecting logs:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
const logCount = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
if (logCount > 0) {
  try {
    await lib.craft('oak_planks', logCount * 4);
  } catch (e) {
    try { await lib.craft('oak_planks', 4); } catch (e2) {}
  }
  try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) await bot.equip(wpick, 'hand');

// 4. Collect 24 cobblestone
console.log('Collecting 24 cobblestone...');
try {
  await lib.collect('cobblestone', 24, 25);
  console.log('Cobblestone collected! Total now:', bot.inventory.count(mcData.itemsByName.cobblestone.id));
} catch (e) {
  console.log('Cobblestone collection note:', e.message);
  const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 15, count: 12 });
  for (const sp of stones) {
    if (bot.inventory.count(mcData.itemsByName.cobblestone.id) >= 24) break;
    try {
      await lib.goTo(sp.x, sp.y, sp.z, 2);
      await lib.dig(sp.x, sp.y, sp.z);
    } catch (e2) {}
  }
}

// 5. Craft stone pickaxe and stone sword
console.log('Crafting stone_pickaxe and stone_sword...');
try {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe!');
} catch (e) {
  console.log('Stone pickaxe craft note:', e.message);
}

try {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword!');
} catch (e) {
  console.log('Stone sword craft note:', e.message);
}

// Equip weapons
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory before portal:', inv);

// 6. Navigate to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Heading up to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1, { dig: true });
} catch (e) {
  console.log('goTo portal note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalPos.x, portalPos.y, portalPos.z, 1));
  } catch (e2) {}
}

// 7. Find nether_portal block and step inside
const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 5
});

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y + 0.5, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 8. Wait for dimension change
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

console.log('End Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
bot.chat(`beta: Re-armed (${inv}) and entering Nether to join mountain breach!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inventory: inv
};
