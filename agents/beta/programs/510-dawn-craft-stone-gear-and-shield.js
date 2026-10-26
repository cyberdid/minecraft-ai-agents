// programs/510-dawn-craft-stone-gear-and-shield.js
console.log('=== Step: Dawn Tool & Shield Production ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// 1. Pass through door to outside (294, 72, -54)
await lib.door(294, 72, -54, true);
await bot.lookAt(new Vec3(294.5, 72.5, -52.5), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.clearControlStates();
await lib.door(294, 72, -54, false);
console.log('Outside base at', lib.fmt(bot.entity.position));

// 2. Scan and chop 5 tree logs nearby
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 20,
  count: 6
});
console.log(`Found ${logs.length} tree logs nearby`);

let chopped = 0;
for (const p of logs) {
  if (isCancelled()) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2.5);
    await lib.dig(p.x, p.y, p.z);
    chopped++;
    console.log(`Chopped log at ${lib.fmt(p)} (${chopped}/4)`);
    if (chopped >= 4) break;
  } catch (e) {
    console.log('Chop error:', e.message);
  }
}

await lib.pickup(6);
console.log('Inv after wood:', JSON.stringify(lib.inv()));

// 3. Step back inside base
await lib.door(294, 72, -54, true);
await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.clearControlStates();
await lib.door(294, 72, -54, false);
console.log('Inside base at', lib.fmt(bot.entity.position));

// 4. Craft planks & sticks in player 2x2 grid
for (const logItem of bot.inventory.items().filter(i => i.name.endsWith('_log'))) {
  const plankName = logItem.name.replace('_log', '_planks');
  const recipe = bot.recipesFor(mcData.itemsByName[plankName]?.id, null, 1, null)[0];
  if (recipe) {
    await bot.craft(recipe, logItem.count, null);
    console.log(`Crafted ${plankName}!`);
  }
}

if (lib.count('*_planks') >= 2) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) await bot.craft(stickRecipe, 1, null);
}

// 5. Craft wooden_pickaxe at base table (295, 72, -56)
const tb = bot.blockAt(new Vec3(295, 72, -56));
if (lib.count('wooden_pickaxe') === 0 && tb && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tb)[0];
  if (wpRecipe) {
    await bot.craft(wpRecipe, 1, tb);
    console.log('Crafted wooden_pickaxe!');
  }
}

// 6. Mine 6 cobblestone from base wall (292, 73, -57..-58)
for (const cp of [new Vec3(292, 73, -57), new Vec3(292, 73, -58), new Vec3(293, 73, -58), new Vec3(294, 73, -58)]) {
  if (lib.count('cobblestone') >= 6) break;
  const b = bot.blockAt(cp);
  if (b && b.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
    try {
      await lib.dig(cp.x, cp.y, cp.z);
      console.log(`Mined cobble at ${lib.fmt(cp)}`);
      await sleep(150);
    } catch (e) {}
  }
}

await lib.pickup(5);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 7. Craft stone_pickaxe and stone_sword at table
if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2 && tb) {
  const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tb)[0];
  if (spRecipe) {
    await bot.craft(spRecipe, 1, tb);
    console.log('SUCCESS: Crafted stone_pickaxe!');
  }
}

if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) await bot.craft(sr, 1, null);
}

if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1 && tb) {
  const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tb)[0];
  if (swRecipe) {
    await bot.craft(swRecipe, 1, tb);
    console.log('SUCCESS: Crafted stone_sword!');
  }
}

// 8. Check chest for iron ingot to craft SHIELD
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    for (const it of items) {
      if (it.name === 'iron_ingot' || it.name === 'shield' || it.name.startsWith('cooked_') || it.name.startsWith('iron_')) {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.name}x${it.count} from chest!`);
      }
    }
    chest.close();
  } catch (e) {}
}

// Craft shield if iron ingot + 6 planks available
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6 && tb) {
  try {
    const shieldRecipe = bot.recipesFor(mcData.itemsByName.shield.id, null, 1, tb)[0];
    if (shieldRecipe) {
      await bot.craft(shieldRecipe, 1, tb);
      console.log('SUCCESS: CRAFTED SHIELD!');
    }
  } catch (e) {}
}

try { await lib.equipArmor(); } catch (e) {}

console.log('Final inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));
bot.chat(`beta: Morning gear ready! Tools: ${JSON.stringify(lib.tools())}, Inv: ${JSON.stringify(lib.inv())}. Heading to Nether!`);
