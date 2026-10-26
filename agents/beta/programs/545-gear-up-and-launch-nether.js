// programs/545-gear-up-and-launch-nether.js
console.log('=== Step: Gear Up at Dawn & Enter Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check ground drops and furnaces inside base first
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8);
for (const d of drops) {
  try { await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5); } catch (e) {}
}

const furnaceIds = [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 6, count: 4 });
for (const fp of furnaces) {
  try {
    const f = await bot.openFurnace(bot.blockAt(fp));
    if (f.outputItem()) {
      console.log(`Withdrawing furnace output: ${f.outputItem().name} x${f.outputItem().count}`);
      try { await f.takeOutput(); } catch (e) {}
    }
    await f.close();
  } catch (e) {}
}

// 2. Check if we need to harvest wood and stone
const hasPick = bot.inventory.items().some(i => i.name.endsWith('_pickaxe'));
const hasSword = bot.inventory.items().some(i => i.name.endsWith('_sword'));
const cobbleCount = bot.inventory.count(mcData.itemsByName.cobblestone.id);

console.log(`Current gear status: pick=${hasPick}, sword=${hasSword}, cobble=${cobbleCount}`);

if (!hasPick || !hasSword || cobbleCount < 16) {
  // Exit door at (294, 72, -54)
  const doorPos = new Vec3(294, 72, -54);
  console.log('Exiting base through door...');
  try {
    await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  } catch (e) {
    try { await lib.goTo(294, 72, -52, 1); } catch (e2) {}
  }

  // Harvest 4 logs from tree at (291, 70, -77)
  const treePos = new Vec3(291, 70, -77);
  console.log('Heading to tree at (291, 70, -77)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(treePos.x, treePos.y, treePos.z, 2));
  } catch (e) {}

  for (let y = 70; y <= 74; y++) {
    const lb = bot.blockAt(new Vec3(291, y, -77));
    if (lb && lb.name.endsWith('_log')) {
      try { await lib.dig(291, y, -77); } catch (e) {}
    }
  }
  await lib.pickup(6);

  // Craft planks, sticks, wooden pickaxe
  const logCount = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((acc, i) => acc + i.count, 0);
  if (logCount > 0) {
    try { await lib.craft('oak_planks', logCount * 4); } catch (e) {}
    try { await lib.craft('stick', 4); } catch (e) {}
  }

  if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
    try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
  }

  // Equip wooden pickaxe
  const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
  if (wpick) await bot.equip(wpick, 'hand');

  // Mine 18 cobblestone
  console.log('Mining cobblestone...');
  const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 12, count: 20 });
  let mined = 0;
  for (const sp of stones) {
    if (mined >= 18 || isCancelled()) break;
    try {
      await lib.goTo(sp.x, sp.y, sp.z, 2);
      await lib.dig(sp.x, sp.y, sp.z);
      mined++;
    } catch (e) {}
  }
  await lib.pickup(6);

  // Craft stone pickaxe and stone sword
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

// Equip stone weapons
await lib.equipWeapon();

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Armed inventory:', inv);

// 3. Navigate to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Heading to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1.5, { dig: true });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(portalPos.x, portalPos.y, portalPos.z, 1)); } catch (e2) {}
}

// Step into nether_portal block
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
} else {
  try { await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 0.5); } catch (e) {}
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// Wait for dimension warp (80 ticks = 4.0s)
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
bot.chat(`beta: In the Nether (${lib.fmt(bot.entity.position)}) with stone tools! Advancing to mountain breach.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inv
};
