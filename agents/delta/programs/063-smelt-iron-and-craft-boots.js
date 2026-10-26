// programs/063-smelt-iron-and-craft-boots.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Put coal into furnace if needed
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
if (lib.count('coal') > 0) {
  for (const f of furnaces) {
    try {
      const fw = await bot.openFurnace(bot.blockAt(f));
      if (!fw.fuelItem() || fw.fuelItem().count < 2) {
        await fw.putFuel(mcData.itemsByName.coal.id, null, 1);
        console.log('Added coal to furnace!');
        await fw.close();
        break;
      }
      await fw.close();
    } catch (e) {}
  }
}

// 2. Wait 35s for iron ingots to smelt
console.log('Waiting 35s for iron ingots to finish smelting in parallel furnaces...');
await sleep(35000);

// 3. Collect all finished iron ingots from all furnaces
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace check note:', err.message);
  }
}

// Also check chest
const chestPos = new Vec3(293, 72, -57);
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  if (chest.iron_ingot) {
    await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  }
  // Check if any food was deposited
  const foodKeys = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
  for (const fk of foodKeys) {
    if (chest[fk]) {
      await lib.withdraw({ [fk]: 1 }, chestPos.x, chestPos.y, chestPos.z);
      await lib.eat();
      console.log(`Ate ${fk}! Food now: ${bot.food}`);
      break;
    }
  }
} catch (e) {}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft iron armor piece (boots = 4 ingots, helmet = 5 ingots, chestplate = 8 ingots)
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
        console.log(`Successfully crafted ${piece.name}!`);
      }
    }
  }
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Armor equipped! Tools:', JSON.stringify(lib.tools()));
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Iron smelting update: holding ${lib.count('iron_ingot')} iron ingots. Armor equipped!`);
