// programs/511-craft-and-enter-nether.js
console.log('=== Step: Fast Tool Crafting & Enter Nether ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft birch_planks from birch_log (2x2 player inventory)
const logItem = bot.inventory.items().find(i => i.name === 'birch_log');
if (logItem) {
  const pRecipe = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (pRecipe) {
    await bot.craft(pRecipe, logItem.count, null);
    console.log(`Crafted birch_planks! Total: ${lib.count('birch_planks')}`);
  }
}

// 2. Craft 4 sticks
if (lib.count('birch_planks') >= 2) {
  const sRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sRecipe) await bot.craft(sRecipe, 1, null);
  console.log(`Crafted sticks! Total: ${lib.count('stick')}`);
}

// 3. Craft crafting_table
if (lib.count('crafting_table') === 0 && lib.count('birch_planks') >= 4) {
  const ctRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
  if (ctRecipe) await bot.craft(ctRecipe, 1, null);
  console.log('Crafted crafting_table!');
}

// 4. Place crafting table and craft wooden pickaxe
let tableBlock = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 })[0];
if (!tableBlock && lib.count('crafting_table') > 0) {
  const spot = await lib.freeSpot();
  if (spot) {
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    tableBlock = spot;
    console.log('Placed crafting table at', lib.fmt(spot));
  }
}

if (tableBlock && lib.count('wooden_pickaxe') === 0) {
  const tb = bot.blockAt(tableBlock);
  const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tb)[0];
  if (wpRecipe) {
    await bot.craft(wpRecipe, 1, tb);
    console.log('SUCCESS: Crafted wooden_pickaxe!');
  }
}

// 5. Mine 5 surface stone blocks
const stones = bot.findBlocks({
  matching: b => b.name === 'stone' || b.name === 'cobblestone',
  maxDistance: 6,
  count: 6
});
console.log(`Found ${stones.length} stone blocks nearby`);

for (const sp of stones) {
  if (lib.count('cobblestone') >= 5) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    console.log(`Mined stone at ${lib.fmt(sp)}`);
    await sleep(150);
  } catch (e) {}
}

await lib.pickup(5);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 6. Craft stone_pickaxe & stone_sword
if (tableBlock && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  const tb = bot.blockAt(tableBlock);
  const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tb)[0];
  if (spRecipe) {
    await bot.craft(spRecipe, 1, tb);
    console.log('SUCCESS: Crafted stone_pickaxe!');
  }
}

if (lib.count('stick') < 1 && lib.count('birch_planks') >= 2) {
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) await bot.craft(sr, 1, null);
}

if (tableBlock && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  const tb = bot.blockAt(tableBlock);
  const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tb)[0];
  if (swRecipe) {
    await bot.craft(swRecipe, 1, tb);
    console.log('SUCCESS: Crafted stone_sword!');
  }
}

console.log('Inv before portal:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));

// 7. Step directly into Nether Portal at (299.5, 73.0, -54.0)
console.log('Walking into Nether Portal block (299.5, 73.0, -54.0)...');
const portalTarget = new Vec3(299.5, 73.0, -54.0);

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.4);
} catch (e) {
  await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.clearControlStates();
}

bot.clearControlStates();
console.log('Standing still inside portal at:', lib.fmt(bot.entity.position));

// 8. Wait for dimension transit to the_nether (4s)
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: ENTERED THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Final dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: In dimension ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Tools: ${JSON.stringify(lib.tools())}. Joining team at Fortress!`);
