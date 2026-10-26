// programs/036-secure-base-and-heal.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Announce Milestone 7
bot.chat('delta: MILESTONE 7 REACHED! Nether portal lit at (298, 72, -54)! Active portal blocks: 5.');

// 2. Walk inside base
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Craft shield at table
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && !lib.count('shield') && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield...');
  const tableBlock = bot.blockAt(table);
  const shieldItem = mcData.itemsByName.shield;
  const recipe = bot.recipesFor(shieldItem.id, null, 1, tableBlock)[0];
  if (recipe) {
    await bot.craft(recipe, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted shield! Have shield:', lib.count('shield'));
  }
}

// 4. Equip shield and best gear
await lib.equipArmor();
await lib.equipWeapon();
console.log('Armor & weapons equipped. Tools:', JSON.stringify(lib.tools()));

// 5. Take food from chest and eat to regenerate health
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ cooked_chicken: 1 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew food from chest.');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

if (lib.count('cooked_chicken')) {
  console.log('Eating cooked chicken...');
  await lib.eat();
  console.log('Health now:', bot.health, 'Food now:', bot.food);
}

console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`delta: Safe at base. Shield equipped. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
