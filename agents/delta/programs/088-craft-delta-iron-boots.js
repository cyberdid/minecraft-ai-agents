// programs/088-craft-delta-iron-boots.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const f1Pos = new Vec3(295, 72, -55);
const f2Pos = new Vec3(295, 72, -57);
const tablePos = new Vec3(295, 72, -56);
const chestPos = new Vec3(293, 72, -57);

// 1. Collect from furnaces
for (const fPos of [f1Pos, f2Pos]) {
  try {
    const fBlock = bot.blockAt(fPos);
    const fw = await bot.openFurnace(fBlock);
    const inI = fw.inputItem();
    const outI = fw.outputItem();
    console.log(`Furnace at ${lib.fmt(fPos)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count}`);
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (e) {
    console.log(`Furnace error:`, e.message);
  }
}

// 2. Collect from chest
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  if (contents.iron_ingot && contents.iron_ingot > 0) {
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${contents.iron_ingot} iron_ingot from chest!`);
  }
} catch (e) {}

console.log('Total iron ingots in Delta inv:', lib.count('iron_ingot'));

// 3. Craft iron boots if >= 4
const tableBlock = bot.blockAt(tablePos);
if (tableBlock && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots at base table...');
  const bootsItem = mcData.itemsByName.iron_boots;
  const rec = bot.recipesFor(bootsItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted iron_boots successfully!');
  }
} else if (lib.count('iron_ingot') < 4) {
  console.log(`Still need ${4 - lib.count('iron_ingot')} more iron ingots for boots.`);
}

// 4. Equip armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Offhand item:', bot.inventory.slots[45]?.name);
console.log('Delta inventory:', JSON.stringify(lib.inv()));

bot.chat(`delta: Equipped gear: ${JSON.stringify(lib.tools())}, offhand: ${bot.inventory.slots[45]?.name}!`);
