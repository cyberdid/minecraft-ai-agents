// programs/555-craft-stone-tools-and-enter-nether.js
console.log('=== Step: Craft Stone Gear and Enter Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Current inv:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 1. Craft planks & sticks
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
if (logs > 0) {
  try { await lib.craft('birch_planks', logs * 4); } catch (e) {
    try { await lib.craft('*_planks', 4); } catch (e2) {}
  }
  try { await lib.craft('stick', 4); } catch (e) {}
}

console.log('Planks in inv:', bot.inventory.items().filter(i => i.name.endsWith('_planks')).map(i => `${i.name}x${i.count}`).join(', '));

// 2. Craft wooden pickaxe
if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('SUCCESS: Crafted wooden_pickaxe!');
  } catch (e) {
    console.log('Craft wooden pickaxe note:', e.message);
  }
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) {
  await bot.equip(wpick, 'hand');
  console.log('Equipped wooden_pickaxe');
}

// 3. Mine 16 cobblestone
console.log('Mining 16 cobblestone...');
const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 12, count: 20 });
let m = 0;
for (const sp of stones) {
  if (m >= 16 || isCancelled()) break;
  try {
    await lib.goTo(sp.x, sp.y, sp.z, 2);
    await lib.dig(sp.x, sp.y, sp.z);
    m++;
  } catch (e) {}
}
await lib.pickup(5);

const cobble = bot.inventory.count(mcData.itemsByName.cobblestone.id);
console.log(`Mined cobblestone: ${cobble}`);

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

// Equip stone weapons
await lib.equipWeapon();

const armedInv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Armed inventory:', armedInv);

// 5. Walk South to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Walking South to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1.5, { dig: true });
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

// 6. Wait for dimension change (80 ticks = 4.0s)
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
bot.chat(`beta: In the Nether with (${armedInv})! Advancing along continuous bridge to join team at Blaze Spawner!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inv: armedInv
};
