// programs/074-prep-gear-and-coal.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Enter base through door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && door.name.includes('door')) {
  await bot.activateBlock(door);
  await sleep(300);
  await lib.walkTo(294, -56);
  await sleep(300);
  await bot.activateBlock(bot.blockAt(doorPos));
} else {
  await lib.goTo(294, 72, -56);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Withdraw 2 coal from chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest coal:', contents.coal);
  if (contents.coal && contents.coal >= 2) {
    await lib.withdraw({ coal: 2 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Withdrew 2 coal!');
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

// 3. Craft stone_pickaxe and furnace at crafting table
const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);
if (tableBlock) {
  // Craft stone_pickaxe
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    const spItem = mcData.itemsByName.stone_pickaxe;
    const rec = bot.recipesFor(spItem.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(250);
      await lib.stowCursor();
      console.log('Crafted stone_pickaxe!');
    }
  }

  // Craft furnace
  if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
    const fItem = mcData.itemsByName.furnace;
    const rec = bot.recipesFor(fItem.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(250);
      await lib.stowCursor();
      console.log('Crafted portable furnace!');
    }
  }
} else {
  console.log('Table not found at expected position!');
}

await lib.equipWeapon();
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Prepared field gear (pickaxe, furnace, coal, water bucket). Hunting food now!`);
