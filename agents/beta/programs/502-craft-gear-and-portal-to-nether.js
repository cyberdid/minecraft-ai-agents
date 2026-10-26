// programs/502-craft-gear-and-portal-to-nether.js
console.log('=== Step: Craft Stone Gear & Portal to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// 1. Pass through door to outside
await lib.door(294, 72, -54, true);
await bot.lookAt(new Vec3(294.5, 72.5, -52.5), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.clearControlStates();
await lib.door(294, 72, -54, false);
console.log('Outside base at', lib.fmt(bot.entity.position));

// 2. Scan and chop 4 tree logs nearby
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 20,
  count: 5
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

// 4. Craft planks and sticks in player inventory
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

// 5. Craft wooden_pickaxe at base crafting table (295, 72, -56)
const tb = bot.blockAt(new Vec3(295, 72, -56));
if (lib.count('wooden_pickaxe') === 0 && tb && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tb)[0];
  if (wpRecipe) {
    await bot.craft(wpRecipe, 1, tb);
    console.log('Crafted wooden_pickaxe!');
  }
}

// 6. Mine 4 cobblestone from base wall (292, 73, -57)
for (const cp of [new Vec3(292, 73, -57), new Vec3(292, 73, -58), new Vec3(293, 73, -58), new Vec3(294, 73, -58)]) {
  if (lib.count('cobblestone') >= 5) break;
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

// Craft extra sticks if needed
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

console.log('Gear crafted:', JSON.stringify(lib.tools()), 'Inv:', JSON.stringify(lib.inv()));

// 8. Step into Nether portal at (299.5, 73.0, -54.0)
console.log('Moving into Nether Portal block...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0.4);
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.clearControlStates();
}

bot.clearControlStates();
console.log('Standing in Nether portal at:', lib.fmt(bot.entity.position));

// Wait up to 12s for dimension transit
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: IN THE NETHER at tick ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Dimension is ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Tools: ${JSON.stringify(lib.tools())}. Joining team!`);
