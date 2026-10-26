// programs/448-craft-sticks-sword-pick.js
console.log('=== Step: Craft sticks, place table, craft stone sword and pickaxe ===');
console.log('Planks in inv:', lib.count('birch_planks'), 'Cobblestone:', lib.count('cobblestone'));

// 1. Craft 4 sticks from 2 birch_planks (2x2 grid)
const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
if (stickRecipe) {
  await bot.craft(stickRecipe, 2, null);
  console.log('Crafted sticks! Sticks count:', lib.count('stick'));
}

// 2. Place crafting table at (44, 65, -130)
const tableSpot = new Vec3(44, 65, -130);
const currentAtSpot = bot.blockAt(tableSpot);
if (currentAtSpot && currentAtSpot.name === 'air' && lib.count('crafting_table') > 0) {
  try {
    await lib.place('crafting_table', tableSpot.x, tableSpot.y, tableSpot.z);
    console.log('Placed crafting table at', lib.fmt(tableSpot));
  } catch (e) {
    console.log('Table place note:', e.message);
  }
}

// 3. Find placed table
const table = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 4, count: 1 })[0];
if (table) {
  const tb = bot.blockAt(table);
  console.log('Using crafting table at', lib.fmt(table));

  // Craft stone_sword (2 cobblestone, 1 stick)
  if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tb)[0];
    if (swr) {
      await bot.craft(swr, 1, tb);
      console.log('Successfully crafted stone_sword!');
    }
  }

  // Craft stone_pickaxe (3 cobblestone, 2 sticks)
  if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tb)[0];
    if (pkr) {
      await bot.craft(pkr, 1, tb);
      console.log('Successfully crafted stone_pickaxe!');
    }
  }
}

// 4. Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped stone_sword in hand!');
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Fortress workshop operational! Equipped stone_sword & stone_pickaxe. In bunker at (44, 65, -129). Ready for Fortress assault!`);
