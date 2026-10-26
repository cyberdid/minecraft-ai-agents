// programs/043-return-to-base-and-regear.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Safe surface travel to base door (keep y >= 70 near base, stay away from aquifer)
console.log('Navigating safely on surface to base (294, 72, -52)...');
await lib.goToXZ(294, -52);

console.log('Pos near base:', lib.fmt(bot.entity.position));

// 2. Approach base door
const doorPos = new Vec3(294, 72, -54);
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);

// 3. Open door and enter base
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
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Withdraw gear from base chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const toWithdraw = {};
if (chest.cobblestone) toWithdraw.cobblestone = Math.min(32, chest.cobblestone);
if (chest.stone_pickaxe) toWithdraw.stone_pickaxe = 1;

if (Object.keys(toWithdraw).length > 0) {
  console.log('Withdrawing gear:', JSON.stringify(toWithdraw));
  await lib.withdraw(toWithdraw, chestPos.x, chestPos.y, chestPos.z);
}

// 5. If we have cobblestone, craft stone sword & stone axe
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table) {
  const tableBlock = bot.blockAt(table);
  // Check if we have sticks or planks
  if (!lib.count('stick') && lib.count('*_planks') >= 2) {
    const plank = Object.keys(lib.inv()).find(k => k.endsWith('_planks'));
    const rec = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, tableBlock)[0];
    if (rec) await bot.craft(rec, 1, tableBlock);
  }
}

await lib.equipWeapon();
console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Tools now:', JSON.stringify(lib.tools()));

bot.chat('delta: Re-geared at base with stone tools and cobblestone. Heading to East hill to mine iron with Alpha & Gamma!');
