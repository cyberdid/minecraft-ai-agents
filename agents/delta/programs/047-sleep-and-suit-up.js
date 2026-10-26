// programs/047-sleep-and-suit-up.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

bot.chat('delta: Inside base by Bed 2. Furnaces smelting iron. Waiting for 12542 to sleep!');

// 1. Wait until sleep window (12542 ticks)
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

// 2. Sleep in Bed 2
console.log('Sleeping in Bed 2 at (293, 72, -55)...');
const bed2 = bot.blockAt(new Vec3(293, 72, -55));
if (bed2 && bed2.name.includes('bed')) {
  try {
    await bot.sleep(bed2);
    console.log('Sleeping peacefully in Bed 2!');
    await sleep(5000);
  } catch (e) {
    console.log('Sleep error:', e.message);
  }
}

console.log('Time after sleep:', JSON.stringify(lib.time()));

// 3. Check furnaces for smelted iron ingots
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

// Check base chest for iron ingots
const chestPos = new Vec3(293, 72, -57);
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
  if (chest.iron_ingot) {
    await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest withdraw note:', e.message);
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft iron armor
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  const tableBlock = bot.blockAt(table);
  const armorPieces = [
    { name: 'iron_chestplate', cost: 8 },
    { name: 'iron_leggings', cost: 7 },
    { name: 'iron_helmet', cost: 5 },
    { name: 'iron_boots', cost: 4 }
  ];
  for (const piece of armorPieces) {
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
}

// 5. Equip armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Morning! Equipped gear. Iron ingots: ${lib.count('iron_ingot')}. Armor ready!`);
