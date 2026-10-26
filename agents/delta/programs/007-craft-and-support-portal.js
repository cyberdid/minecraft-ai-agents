// programs/007-craft-and-support-portal.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Step inside base to (294, 72, -56)
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -56, 1));
console.log('Now at:', lib.fmt(bot.entity.position));

// Close door if open
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlock && doorBlock.name.includes('door')) {
  const isOpen = doorBlock.getProperties().open;
  console.log('Door isOpen:', isOpen);
  if (isOpen) {
    await bot.activateBlock(doorBlock);
    await sleep(200);
    console.log('Closed door, now:', bot.blockAt(new Vec3(294, 72, -54)).getProperties().open);
  }
}

// Crafting table at (295, 72, -56) or nearby
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (!table) throw new Error('No crafting table near base');
const tableBlock = bot.blockAt(table);
console.log('Using crafting table at:', lib.fmt(table));

async function craftAtTable(itemName, countNeeded) {
  const item = mcData.itemsByName[itemName];
  if (!item) throw new Error(`Unknown item ${itemName}`);
  const recipes = bot.recipesFor(item.id, null, 1, tableBlock);
  if (!recipes.length) throw new Error(`No recipe for ${itemName} at table`);
  const recipe = recipes[0];
  const times = Math.ceil(countNeeded / recipe.result.count);
  console.log(`Crafting ${itemName} x${countNeeded} (times: ${times})...`);
  await bot.craft(recipe, times, tableBlock);
  await sleep(250);
  await lib.stowCursor();
  console.log(`Crafted ${itemName}, have: ${lib.count(itemName)}`);
}

// Craft sticks and stone tools
if (lib.count('stick') < 8) {
  await craftAtTable('stick', 8);
}
if (!lib.count('stone_sword')) {
  await craftAtTable('stone_sword', 1);
}
if (!lib.count('stone_pickaxe')) {
  await craftAtTable('stone_pickaxe', 1);
}
if (!lib.count('stone_axe')) {
  await craftAtTable('stone_axe', 1);
}

await lib.equipWeapon();
console.log('Tools now:', JSON.stringify(lib.tools()));
console.log('Inv now:', JSON.stringify(lib.inv()));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// Check portal frame status
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const portalMats = lib.materials(portalFrame);
console.log('Portal materials status:', JSON.stringify(portalMats));

bot.chat('delta: Stone tools crafted! Standing by at base to support portal build & lighting!');
