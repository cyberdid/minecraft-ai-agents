// programs/490-craft-wooden-and-stone-tools.js
console.log('=== Step: Craft Wooden & Stone Tools at Dawn ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Move next to base crafting table (295, 72, -56)
const tablePos = new Vec3(295, 72, -56);
const tb = bot.blockAt(tablePos);
console.log('Crafting table block:', tb?.name);

// 2. Craft wooden_pickaxe (3 birch_planks + 2 sticks)
if (lib.count('wooden_pickaxe') === 0 && tb) {
  try {
    const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tb)[0];
    if (wpRecipe) {
      await bot.craft(wpRecipe, 1, tb);
      console.log('SUCCESS: Crafted wooden_pickaxe!');
    } else {
      console.log('No wpRecipe found, trying lib.craft');
      await lib.craft('wooden_pickaxe', 1);
    }
  } catch (e) {
    console.log('Craft wooden_pickaxe error:', e.message);
  }
}

console.log('Inv after wooden pick:', JSON.stringify(lib.inv()));

// 3. Mine 3 cobblestone from base wall (292, 73, -57)
for (const p of [new Vec3(292, 73, -57), new Vec3(292, 73, -58), new Vec3(293, 73, -58)]) {
  if (lib.count('cobblestone') >= 3) break;
  const b = bot.blockAt(p);
  if (b && b.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
    try {
      await lib.dig(p.x, p.y, p.z);
      console.log(`Mined cobble at ${lib.fmt(p)}!`);
      await sleep(250);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

await lib.pickup(5);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft stone_pickaxe at crafting table
if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2 && tb) {
  try {
    const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tb)[0];
    if (spRecipe) {
      await bot.craft(spRecipe, 1, tb);
      console.log('SUCCESS: CRAFTED STONE_PICKAXE!');
    }
  } catch (e) {
    console.log('Craft stone_pickaxe error:', e.message);
  }
}

// 5. Mine 5 more cobblestone with stone_pickaxe from base wall
for (const p of [new Vec3(294, 73, -58), new Vec3(295, 73, -58), new Vec3(296, 73, -58)]) {
  const b = bot.blockAt(p);
  if (b && b.name === 'cobblestone' && lib.count('stone_pickaxe') > 0) {
    try {
      await lib.dig(p.x, p.y, p.z);
      console.log(`Mined wall cobble at ${lib.fmt(p)}!`);
      await sleep(200);
    } catch (e) {}
  }
}

await lib.pickup(5);

// 6. Craft stone_sword at table (needs 2 cobblestone + 1 stick)
// Craft sticks first if needed
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try {
    const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (stickRecipe) await bot.craft(stickRecipe, 1, null);
  } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1 && tb) {
  try {
    const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tb)[0];
    if (swRecipe) {
      await bot.craft(swRecipe, 1, tb);
      console.log('SUCCESS: CRAFTED STONE_SWORD!');
    }
  } catch (e) {}
}

console.log('Final inv:', JSON.stringify(lib.inv()), 'Tools:', JSON.stringify(lib.tools()));
bot.chat(`beta: Morning progression complete! Tools: ${JSON.stringify(lib.tools())}, Inv: ${JSON.stringify(lib.inv())}`);
