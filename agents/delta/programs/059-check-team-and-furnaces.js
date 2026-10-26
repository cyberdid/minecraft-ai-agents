// programs/059-check-team-and-furnaces.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Check all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// 2. Check base chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

// 3. Check furnaces for smelted items
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} fuel=${fw.fuelItem()?.name}x${fw.fuelItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

// 4. If chest has food, withdraw 1 and eat to bring food >= 18 so health regenerates to 20
const foodKeys = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
for (const fk of foodKeys) {
  if (chest[fk]) {
    console.log(`Withdrawing ${fk}...`);
    await lib.withdraw({ [fk]: 1 }, chestPos.x, chestPos.y, chestPos.z);
    await lib.eat();
    console.log(`Ate ${fk}! Food now: ${bot.food}, Health: ${bot.health}`);
    break;
  }
}

// 5. If chest has iron ingots, withdraw them
if (chest.iron_ingot) {
  console.log(`Withdrawing ${chest.iron_ingot} iron_ingot from chest...`);
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
}

console.log('Delta iron ingots:', lib.count('iron_ingot'));

// 6. If table available and iron ingots >= 4, craft armor
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  const tableBlock = bot.blockAt(table);
  const pieces = [
    { name: 'iron_chestplate', cost: 8 },
    { name: 'iron_leggings', cost: 7 },
    { name: 'iron_helmet', cost: 5 },
    { name: 'iron_boots', cost: 4 }
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
      }
    }
  }
  await lib.equipArmor();
}

console.log('Tools & gear:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Base report: Health: ${bot.health}/20, Food: ${bot.food}/20, Water bucket: ${lib.count('water_bucket')}. Holding ${lib.count('iron_ingot')} iron ingots.`);
