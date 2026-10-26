// programs/474-walk-in-craft-tools.js
console.log('=== Step: Walk into Base & Craft Tools ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Walk right into the base
try {
  await lib.goTo(294.5, 72.0, -55.5, 0.5);
  console.log('Walked inside base:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk error, trying walkTo:', e.message);
  await lib.walkTo(294.5, -55.5);
}

// 2. Craft all logs into planks
for (const logName of ['oak_log', 'birch_log']) {
  const item = bot.inventory.items().find(i => i.name === logName);
  if (item) {
    const plankName = logName.replace('_log', '_planks');
    const recipe = bot.recipesFor(mcData.itemsByName[plankName]?.id, null, 1, null)[0];
    if (recipe) {
      await bot.craft(recipe, item.count, null);
      console.log(`Crafted ${item.count}x ${logName} into ${plankName}!`);
    }
  }
}

console.log('Planks: oak=', lib.count('oak_planks'), 'birch=', lib.count('birch_planks'), 'sticks=', lib.count('stick'));

// 3. Craft wooden_pickaxe at table (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (lib.count('wooden_pickaxe') === 0 && tableBlock) {
  const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
  if (wpRecipe) {
    await bot.craft(wpRecipe, 1, tableBlock);
    console.log('Crafted wooden_pickaxe!');
  } else {
    console.log('No wooden_pickaxe recipe found');
  }
}

// 4. Mine 3 cobblestone from base wall (292, 73, -57)
for (const cobbleTarget of [new Vec3(292, 73, -57), new Vec3(292, 73, -58), new Vec3(293, 73, -58)]) {
  const cb = bot.blockAt(cobbleTarget);
  if (cb && cb.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
    try {
      await lib.dig(cobbleTarget.x, cobbleTarget.y, cobbleTarget.z);
      console.log(`Mined cobble at ${lib.fmt(cobbleTarget)}`);
      await sleep(300);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

// Pick up drops
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

// 7. Check base chest for iron ingots or door
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    // Withdraw any iron_ingot or oak_door
    for (const item of items) {
      if (item.name === 'iron_ingot' || item.name === 'oak_door' || item.name.endsWith('_pickaxe') || item.name.endsWith('_sword') || item.name === 'shield') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count} from chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// If we got the oak door, place it back at (294, 72, -54)
if (lib.count('oak_door') > 0 && bot.blockAt(new Vec3(294, 72, -54))?.name === 'air') {
  try {
    await lib.place('oak_door', 294, 72, -54);
    console.log('Re-placed oak door at (294, 72, -54)!');
  } catch (e) {
    console.log('Door place error:', e.message);
  }
}

console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Progression update! Inv: ${JSON.stringify(lib.inv())}`);
