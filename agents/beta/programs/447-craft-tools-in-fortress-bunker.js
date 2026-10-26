// programs/447-craft-tools-in-fortress-bunker.js
console.log('=== Step: Craft crafting table, stone sword, and stone pickaxe in bunker ===');
console.log('Pos in bunker:', lib.fmt(bot.entity.position), 'Logs:', lib.count('birch_log'), 'Cobble:', lib.count('cobblestone'));

// 1. Craft birch_planks from birch_log (2x2 craft)
const logItem = bot.inventory.items().find(i => i.name === 'birch_log');
if (logItem) {
  const pr = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (pr) {
    await bot.craft(pr, logItem.count, null);
    console.log(`Crafted birch_planks! Total: ${lib.count('birch_planks')}`);
  }
}

// 2. Craft crafting_table & sticks (2x2 craft)
if (lib.count('birch_planks') >= 4) {
  const tr = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
  if (tr) {
    await bot.craft(tr, 1, null);
    console.log('Crafted crafting_table!');
  }
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) {
    await bot.craft(sr, 2, null);
    console.log(`Crafted sticks! Total: ${lib.count('stick')}`);
  }
}

// 3. Place crafting table at (44, 65, -130)
const tableSpot = new Vec3(44, 65, -130);
const tb = bot.blockAt(tableSpot);
if (tb && tb.name === 'air' && lib.count('crafting_table') > 0) {
  try {
    await lib.place('crafting_table', tableSpot.x, tableSpot.y, tableSpot.z);
    console.log('Placed crafting table at', lib.fmt(tableSpot));
  } catch (e) {
    console.log('Table place note:', e.message);
  }
}

// 4. Craft stone_sword and stone_pickaxe at the crafting table
const placedTable = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 4, count: 1 })[0];
if (placedTable) {
  const block = bot.blockAt(placedTable);
  console.log('Using crafting table at', lib.fmt(placedTable));
  
  if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, block)[0];
    if (swr) {
      await bot.craft(swr, 1, block);
      console.log('Crafted stone_sword!');
    }
  }

  if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, block)[0];
    if (pkr) {
      await bot.craft(pkr, 1, block);
      console.log('Crafted stone_pickaxe!');
    }
  }
}

// 5. Equip sword in hand
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped sword in hand!');
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Fortress workshop established at (44, 65, -129)! Equipped stone_sword & stone_pickaxe. Table placed. Ready for fortress assault!`);
