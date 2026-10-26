// programs/067-finalize-iron-boots.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

// 1. Check furnaces for finished iron
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {}
}

// 2. Check chest for iron ingots
if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
}

// Check chest for food
const foodKeys = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
for (const fk of foodKeys) {
  if (chest[fk]) {
    await lib.withdraw({ [fk]: 1 }, chestPos.x, chestPos.y, chestPos.z);
    try {
      await lib.eat();
      console.log(`Ate ${fk}! Food now: ${bot.food}`);
    } catch (e) {}
    break;
  }
}

console.log('Total iron ingots in delta inventory:', lib.count('iron_ingot'));

// 3. Craft iron_boots if we have >= 4
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots at base table...');
  const tableBlock = bot.blockAt(table);
  const bootsItem = mcData.itemsByName.iron_boots;
  const rec = bot.recipesFor(bootsItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted iron_boots! Count:', lib.count('iron_boots'));
  }
  await lib.equipArmor();
} else if (lib.count('iron_ingot') > 0 && lib.count('iron_ingot') < 4) {
  // Deposit for Beta if we don't have enough for boots yet
  console.log('Pooling 2 iron ingots into chest for Beta...');
  await lib.deposit({ iron_ingot: lib.count('iron_ingot') }, chestPos.x, chestPos.y, chestPos.z);
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Gear equipped: ${JSON.stringify(lib.tools())}. Water bucket ready!`);
