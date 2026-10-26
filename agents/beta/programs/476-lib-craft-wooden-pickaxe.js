// programs/476-lib-craft-wooden-pickaxe.js
console.log('=== Step: Craft Oak Planks & Wooden Pickaxe using lib ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Recover any stuck items
try {
  await lib.stowCursor();
  await lib.clearCraftingGrid();
} catch (e) {}

console.log('Inv after stow:', JSON.stringify(lib.inv()));

// 2. Craft 4 oak_planks
if (lib.count('oak_planks') < 4 && lib.count('oak_log') > 0) {
  try {
    await lib.craft('oak_planks', 4);
    console.log('Crafted oak_planks! Total:', lib.count('oak_planks'));
  } catch (e) {
    console.log('Craft planks error:', e.message);
  }
}

// 3. Ensure crafting table is nearby or place one
let table = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6, count: 1 })[0];
if (!table && lib.count('crafting_table') > 0) {
  const spot = await lib.freeSpot();
  if (spot) {
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    table = spot;
    console.log('Placed crafting table at', lib.fmt(spot));
  }
}

// 4. Craft wooden_pickaxe
if (lib.count('wooden_pickaxe') === 0 && lib.count('oak_planks') >= 3 && lib.count('stick') >= 2) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('SUCCESS: Crafted wooden_pickaxe!');
  } catch (e) {
    console.log('Craft wooden_pickaxe error:', e.message);
  }
}

// 5. Mine 3 cobblestone from base wall (292, 73, -57)
const cobblePositions = [
  new Vec3(292, 73, -57),
  new Vec3(292, 73, -58),
  new Vec3(293, 73, -58),
  new Vec3(294, 73, -58)
];

for (const cp of cobblePositions) {
  if (lib.count('cobblestone') >= 3) break;
  const b = bot.blockAt(cp);
  if (b && b.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
    try {
      await lib.dig(cp.x, cp.y, cp.z);
      console.log(`Mined cobblestone at ${lib.fmt(cp)}!`);
      await sleep(300);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

// Pickup drops
await lib.pickup(5);

console.log('Cobblestone count:', lib.count('cobblestone'));

// 6. Craft stone_pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('SUCCESS: Crafted stone_pickaxe!');
  } catch (e) {
    console.log('Craft stone_pickaxe error:', e.message);
  }
}

console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`beta: Tools update! Inv: ${JSON.stringify(lib.inv())}`);
