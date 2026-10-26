// programs/101-rearm-stone-tools.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  const r = await lib.obtain('stone_pickaxe', 2);
  console.log('Obtained pickaxes! Steps:', JSON.stringify(r.steps));
} catch (e) {
  console.log('Obtain pickaxe note:', e.message);
}

// 2. Obtain stone_sword
console.log('Obtaining stone_sword...');
try {
  const r2 = await lib.obtain('stone_sword', 1);
  console.log('Obtained sword! Steps:', JSON.stringify(r2.steps));
} catch (e) {
  console.log('Obtain sword note:', e.message);
}

// 3. Collect 20 cobblestone
if (lib.count('stone_pickaxe') > 0 && lib.count('cobblestone') < 20) {
  console.log('Collecting cobblestone for tools & building...');
  try {
    await lib.collect('cobblestone', 20);
    console.log('Cobblestone count now:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect cobblestone note:', e.message);
  }
}

// 4. Check base chest for building blocks and gear
const chestPos = new Vec3(293, 72, -57);
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
  const toWithdraw = {};
  if (chest.granite) toWithdraw.granite = Math.min(chest.granite, 32);
  if (chest.diorite) toWithdraw.diorite = Math.min(chest.diorite, 32);
  if (chest.iron_ingot) toWithdraw.iron_ingot = chest.iron_ingot;
  if (Object.keys(toWithdraw).length > 0) {
    await lib.withdraw(toWithdraw, chestPos.x, chestPos.y, chestPos.z);
    console.log('Withdrew building blocks:', JSON.stringify(toWithdraw));
  }
} catch (e) {}

// 5. Craft shield if we have planks + iron_ingot
const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);
if (tableBlock && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6 && !lib.count('shield')) {
  console.log('Crafting shield...');
  const rec = bot.recipesFor(mcData.itemsByName.shield.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(200);
    await lib.stowCursor();
    console.log('Crafted shield!');
  }
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Delta equipped:', JSON.stringify(lib.tools()));
console.log('Delta inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Re-armed! Gear: ${JSON.stringify(lib.tools())}. Inv: ${JSON.stringify(lib.inv())}. Ready to re-enter Nether!`);
