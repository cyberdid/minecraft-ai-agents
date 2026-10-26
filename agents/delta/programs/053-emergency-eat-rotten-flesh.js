// programs/053-emergency-eat-rotten-flesh.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const chestPos = new Vec3(293, 72, -57);

// 1. Withdraw emergency rotten flesh from chest
try {
  await lib.withdraw({ rotten_flesh: 4 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew emergency rotten_flesh!');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 2. Consume rotten flesh to stop starvation
if (lib.count('rotten_flesh') > 0) {
  console.log('Eating emergency rotten flesh...');
  const fleshItem = mcData.itemsByName.rotten_flesh;
  for (let i = 0; i < lib.count('rotten_flesh'); i++) {
    if (bot.food >= 12) break;
    await bot.equip(fleshItem.id, 'hand');
    await bot.consume();
    await sleep(200);
  }
  console.log('Consumed! Food now:', bot.food, 'Health now:', bot.health);
}

// 3. Check furnaces for any smelted iron ingots
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
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

// 4. Check if iron armor can be crafted
console.log('Iron ingots in inventory:', lib.count('iron_ingot'));
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

bot.chat(`delta: Ate emergency food from chest. Food: ${bot.food}/20, Health: ${bot.health}/20. Alpha/Gamma, please bring cooked meat to base chest!`);
