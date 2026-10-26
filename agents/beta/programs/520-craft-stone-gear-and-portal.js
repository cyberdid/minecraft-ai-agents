// programs/520-craft-stone-gear-and-portal.js
console.log('=== Step: Craft Stone Gear & Transit to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

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
    console.log('Crafted stone_pickaxe via lib.craft!');
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
    console.log('Crafted stone_sword via lib.craft!');
  }
} catch (e) {
  console.log('Sword craft note:', e.message);
}

// 4. Recover the crafting table
console.log('Digging up crafting table...');
try {
  await lib.dig(table.position.x, table.position.y, table.position.z);
} catch (e) {
  console.log('Could not dig table (maybe already permanent):', e.message);
}

// 5. Equip stone pickaxe / sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory before heading to portal:', inv);

// 6. Navigate to Nether Portal at (298.5, 73.0, -54.0)
const portalTarget = new Vec3(298.5, 73.0, -54.0);
console.log(`Heading up to Nether Portal at ${lib.fmt(portalTarget)}...`);

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 1.0, { dig: true });
} catch (e) {
  console.log('goTo portal note:', e.message);
  // Intermediate waypoint at base floor y=72
  try {
    await lib.goTo(294, 72, -54, 1.5, { dig: true });
    await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 1.0, { dig: true });
  } catch (e2) {
    console.log('Manual walk up:', e2.message);
  }
}

console.log('Position near portal:', lib.fmt(bot.entity.position));

// 7. Step inside the Nether Portal block
const portalBlocks = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal?.id,
  maxDistance: 6,
  count: 4
});

if (portalBlocks.length > 0) {
  const pb = portalBlocks[0];
  console.log(`Stepping directly into nether_portal block at ${lib.fmt(pb)}...`);
  await bot.lookAt(new Vec3(pb.x + 0.5, pb.y + 0.5, pb.z + 0.5), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
} else {
  console.log('Walking straight into portal target...');
  await lib.walkTo(portalTarget.x, portalTarget.z);
}

bot.clearControlStates();
console.log('Standing completely still inside portal frame at:', lib.fmt(bot.entity.position));

// 8. Wait for dimension warp (80 ticks = 4.0s)
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`WARPED TO THE NETHER! Second: ${s + 1}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

console.log('End Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
