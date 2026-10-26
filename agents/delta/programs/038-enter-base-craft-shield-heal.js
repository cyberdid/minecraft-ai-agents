// programs/038-enter-base-craft-shield-heal.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk to base door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 2. Craft shield at base crafting table
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && !lib.count('shield') && lib.count('iron_ingot') >= 1) {
  const tableBlock = bot.blockAt(table);
  const shieldId = mcData.itemsByName.shield.id;
  const recipe = bot.recipesFor(shieldId, null, 1, tableBlock)[0];
  if (recipe) {
    console.log('Crafting shield...');
    await bot.craft(recipe, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted shield! Have shield:', lib.count('shield'));
  }
}

// 3. Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();
console.log('Tools & gear:', JSON.stringify(lib.tools()));

// 4. Check chest for cooked food and eat
const chestPos = new Vec3(293, 72, -57);
const chestContents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chestContents));

if (chestContents.cooked_chicken) {
  await lib.withdraw({ cooked_chicken: 1 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew cooked_chicken!');
  await lib.eat();
  console.log('Ate food! Health:', bot.health, 'Food:', bot.food);
}

// 5. Deposit excess blocks into chest to free inventory
await lib.deposit({
  granite: 'all',
  diorite: 'all',
  andesite: 'all',
  gravel: 'all',
  lapis_lazuli: 'all',
  cobbled_deepslate: 'all',
  rotten_flesh: 'all'
}, chestPos.x, chestPos.y, chestPos.z);

console.log('Inventory after organizing:', JSON.stringify(lib.inv()));
bot.chat(`delta: Inside base. Shield equipped, inventory organized! Health: ${bot.health}/20.`);
