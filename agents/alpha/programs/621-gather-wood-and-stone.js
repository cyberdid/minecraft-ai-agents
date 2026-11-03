// programs/621-gather-wood-and-stone.js
console.log('=== Program 621: Gather Wood, Craft Tools & Stone Gear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Gather 3 logs
console.log('Collecting 3 logs...');
const logBlock = bot.findBlock({
  matching: b => b.name.includes('_log'),
  maxDistance: 25
});
console.log('Found log at:', logBlock ? lib.fmt(logBlock.position) : 'none');

if (logBlock) {
  try {
    await lib.collect(logBlock.name, 3, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Collect log error:', e.message);
  }
}

console.log('Inv after logs:', lib.inv());

// 2. Craft planks from logs (2x2 inventory grid)
const logItem = bot.inventory.items().find(i => i.name.includes('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  const plankData = mcData.itemsByName[plankName];
  if (plankData) {
    const plankRecipe = bot.recipesFor(plankData.id, null, 1, null)[0];
    if (plankRecipe) {
      console.log(`Crafting planks from ${logItem.name} x${logItem.count}...`);
      await bot.craft(plankRecipe, logItem.count, null);
    }
  }
}
console.log('Inv after planks:', lib.inv());

// 3. Craft sticks in 2x2 grid
const plankItem = bot.inventory.items().find(i => i.name.includes('_planks'));
if (plankItem && plankItem.count >= 2 && lib.count('stick') < 4) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) {
    console.log('Crafting sticks...');
    await bot.craft(stickRecipe, 1, null);
  }
}
console.log('Inv after sticks:', lib.inv());

// 4. Place crafting table at (295, 72, -56) if not present
let tablePos = new Vec3(295, 72, -56);
let tableBlock = bot.blockAt(tablePos);
if (!tableBlock || !tableBlock.name.includes('crafting_table')) {
  // Check if we have a table in inventory, or craft one
  if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
    const tableRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
    if (tableRecipe) {
      console.log('Crafting crafting_table in 2x2 grid...');
      await bot.craft(tableRecipe, 1, null);
    }
  }
  
  if (lib.count('crafting_table') > 0) {
    console.log('Placing crafting table at (295, 72, -56)...');
    try {
      await lib.place('crafting_table', tablePos);
    } catch (e) {
      console.log('Place table error:', e.message);
    }
  }
}
tableBlock = bot.blockAt(tablePos);
console.log('Table block status:', tableBlock?.name);

// 5. Craft wooden pickaxe
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try {
    if (tableBlock && tableBlock.name.includes('crafting_table')) {
      const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
      if (wpRecipe) await bot.craft(wpRecipe, 1, tableBlock);
    } else {
      await lib.craft('wooden_pickaxe', 1);
    }
  } catch (e) {
    console.log('Wooden pick error:', e.message);
  }
}
console.log('Inv after wooden pick:', lib.inv());

// 6. Mine 12 cobblestone from quarry (302, 71, -44)
if (lib.count('*pickaxe') > 0 && lib.count('cobblestone') < 12) {
  console.log('Mining 12 cobblestone at surface quarry...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 6000 });
    await lib.collect('cobblestone', 12, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Cobblestone collect note:', e.message);
  }
}
console.log('Inv after cobblestone:', lib.inv());

// 7. Craft stone pickaxe and stone sword
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone pickaxe...');
  try {
    const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
    if (spRecipe) await bot.craft(spRecipe, 1, tableBlock);
  } catch (e) {}
}

if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone sword...');
  try {
    const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
    if (swRecipe) await bot.craft(swRecipe, 1, tableBlock);
  } catch (e) {}
}

await lib.equipWeapon();
console.log('=== GEAR COMPLETE ===');
console.log('Inventory:', lib.inv(), 'Held:', bot.heldItem?.name);
bot.chat(`alpha: Rearmed! Held: ${bot.heldItem?.name || 'none'}, Cobble: ${lib.count('cobblestone')}, Planks: ${lib.count('*_planks')}`);
