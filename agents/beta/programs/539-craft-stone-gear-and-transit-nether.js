// programs/539-craft-stone-gear-and-transit-nether.js
console.log('=== Step: Craft Stone Gear, Cobble Reserve, and Enter Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 1. Ensure crafting table right here
console.log('Ensuring crafting table...');
const table = await lib.ensureTable();
console.log(`Crafting table at: ${lib.fmt(table.position)}`);

// 2. Craft stone pickaxe
console.log('Crafting stone_pickaxe...');
try {
  const pickRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, table)[0];
  if (pickRecipe) {
    await bot.craft(pickRecipe, 1, table);
    console.log('Crafted stone_pickaxe via bot.craft!');
  } else {
    await lib.craft('stone_pickaxe', 1);
  }
} catch (e) {
  console.log('Pickaxe craft note:', e.message);
  await lib.craft('stone_pickaxe', 1);
}

// 3. Craft stone sword
console.log('Crafting stone_sword...');
try {
  const swordRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, table)[0];
  if (swordRecipe) {
    await bot.craft(swordRecipe, 1, table);
    console.log('Crafted stone_sword via bot.craft!');
  } else {
    await lib.craft('stone_sword', 1);
  }
} catch (e) {
  console.log('Sword craft note:', e.message);
}

// 4. Dig up the crafting table so we keep it
console.log('Digging up crafting table...');
try {
  await lib.dig(table.position.x, table.position.y, table.position.z);
} catch (e) {}

// Equip stone pickaxe to mine stone reserve
const spick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (spick) await bot.equip(spick, 'hand');

// 5. Mine stone if cobblestone < 20
const currentCobble = bot.inventory.count(mcData.itemsByName.cobblestone.id);
console.log(`Cobblestone before top-up: ${currentCobble}`);
if (currentCobble < 20) {
  const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 10, count: 12 });
  for (const sp of stones) {
    if (bot.inventory.count(mcData.itemsByName.cobblestone.id) >= 20 || isCancelled()) break;
    try {
      await lib.goTo(sp.x, sp.y, sp.z, 2);
      await lib.dig(sp.x, sp.y, sp.z);
    } catch (e) {}
  }
  await lib.pickup(4);
}

// Equip stone sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Armed Inventory:', inv);

// 6. Navigate to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Heading up to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1.5, { dig: true });
} catch (e) {
  console.log('goTo portal note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalPos.x, portalPos.y, portalPos.z, 1));
  } catch (e2) {
    console.log('pathfinder to portal note:', e2.message);
  }
}

console.log('Near portal at:', lib.fmt(bot.entity.position));

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
} else {
  console.log('Walking directly into portal frame coordinates...');
  try { await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 0.5); } catch (e) {}
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 8. Wait for dimension warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`SUCCESS: ENTERED THE NETHER! Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

console.log('End Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`beta: Armed with stone gear (${inv}) and entering Nether to advance to mountain breach!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inv
};
