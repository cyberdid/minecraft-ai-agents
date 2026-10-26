// programs/473-enter-base-and-craft-stone-tools.js
console.log('=== Step: Enter Base & Craft Wooden + Stone Tools ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Enter through door into base
await lib.goThroughDoor(294, 72, -54, { close: false });
console.log('Inside base at', lib.fmt(bot.entity.position));

// 2. Craft all logs into planks (inventory craft)
for (const logName of ['oak_log', 'birch_log']) {
  const item = bot.inventory.items().find(i => i.name === logName);
  if (item) {
    const plankName = logName.replace('_log', '_planks');
    const recipe = bot.recipesFor(mcData.itemsByName[plankName]?.id, null, 1, null)[0];
    if (recipe) {
      await bot.craft(recipe, item.count, null);
      console.log(`Crafted ${plankName}!`);
    }
  }
}

console.log('Planks now: oak=', lib.count('oak_planks'), 'birch=', lib.count('birch_planks'));

// 3. Craft wooden_pickaxe at base crafting table (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (lib.count('wooden_pickaxe') === 0 && tableBlock) {
  const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
  if (wpRecipe) {
    await bot.craft(wpRecipe, 1, tableBlock);
    console.log('Crafted wooden_pickaxe!');
  } else {
    console.log('Could not find wooden_pickaxe recipe with tableBlock!');
  }
}

// 4. Mine 3 cobblestone from base wall (292, 73, -57)
const cobbleTarget = new Vec3(292, 73, -57);
const cb = bot.blockAt(cobbleTarget);
if (cb && cb.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
  try {
    await lib.dig(cobbleTarget.x, cobbleTarget.y, cobbleTarget.z);
    console.log('Mined 1st cobblestone!');
  } catch (e) {
    console.log('Dig 1 error:', e.message);
  }
}

// Mine another cobblestone from wall (292, 73, -58)
const cobbleTarget2 = new Vec3(292, 73, -58);
const cb2 = bot.blockAt(cobbleTarget2);
if (cb2 && cb2.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
  try {
    await lib.dig(cobbleTarget2.x, cobbleTarget2.y, cobbleTarget2.z);
    console.log('Mined 2nd cobblestone!');
  } catch (e) {
    console.log('Dig 2 error:', e.message);
  }
}

// Mine 3rd cobblestone from wall (293, 73, -58)
const cobbleTarget3 = new Vec3(293, 73, -58);
const cb3 = bot.blockAt(cobbleTarget3);
if (cb3 && cb3.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
  try {
    await lib.dig(cobbleTarget3.x, cobbleTarget3.y, cobbleTarget3.z);
    console.log('Mined 3rd cobblestone!');
  } catch (e) {
    console.log('Dig 3 error:', e.message);
  }
}

// Pick up drops inside base
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 5
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5);
  } catch (e) {}
}

console.log('Cobblestone count:', lib.count('cobblestone'));

// 5. Craft stone_pickaxe at crafting table
if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2 && tableBlock) {
  const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
  if (spRecipe) {
    await bot.craft(spRecipe, 1, tableBlock);
    console.log('SUCCESS: Crafted stone_pickaxe!');
  }
}

// 6. Craft stone_sword at crafting table
if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1 && tableBlock) {
  const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
  if (swRecipe) {
    await bot.craft(swRecipe, 1, tableBlock);
    console.log('SUCCESS: Crafted stone_sword!');
  }
}

console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Progression update! Inv: ${JSON.stringify(lib.inv())}. Stone tools equipped!`);
