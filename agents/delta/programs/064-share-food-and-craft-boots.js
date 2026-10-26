// programs/064-share-food-and-craft-boots.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Ask team for food and pickup any dropped items inside base
bot.chat('team: Delta food at 3/20. Please toss 1-2 cooked meat or put in chest!');
const picked = await lib.pickup(6);
console.log(`Picked up ${picked} items on floor`);

// 2. Check chest for food
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const foodKeys = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'beef', 'mutton', 'porkchop', 'chicken', 'rotten_flesh'];
for (const fk of foodKeys) {
  if (chest[fk]) {
    console.log(`Withdrawing ${fk} from chest...`);
    await lib.withdraw({ [fk]: Math.min(2, chest[fk]) }, chestPos.x, chestPos.y, chestPos.z);
    try {
      await lib.eat();
      console.log(`Ate ${fk}! Food now: ${bot.food}, Health: ${bot.health}`);
    } catch (e) {}
    break;
  }
}

// 3. Check furnaces for finished iron ingots
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

if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft armor if ingots >= 4
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  const tableBlock = bot.blockAt(table);
  const pieces = [
    { name: 'iron_boots', cost: 4 },
    { name: 'iron_helmet', cost: 5 },
    { name: 'iron_chestplate', cost: 8 },
    { name: 'iron_leggings', cost: 7 }
  ];
  for (const piece of pieces) {
    if (!lib.count(piece.name) && lib.count('iron_ingot') >= piece.cost) {
      console.log(`Crafting ${piece.name}...`);
      const item = mcData.itemsByName[piece.name];
      const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
      if (rec) {
        await bot.craft(rec, 1, tableBlock);
        await sleep(250);
        await lib.stowCursor();
        console.log(`Crafted ${piece.name}!`);
      }
    }
  }
  await lib.equipArmor();
  await lib.equipWeapon();
}

console.log('Final tools & armor:', JSON.stringify(lib.tools()));
bot.chat(`delta: Holding ${lib.count('iron_ingot')} iron ingots. Armor equipped: ${JSON.stringify(lib.tools())}.`);
