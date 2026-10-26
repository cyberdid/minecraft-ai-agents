// programs/084-smelt-iron-and-craft-boots.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);

// 1. Inspect furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const inI = fw.inputItem();
    const outI = fw.outputItem();
    const fuelI = fw.fuelItem();
    console.log(`Furnace at ${lib.fmt(f)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count} fuel=${fuelI?.name}x${fuelI?.count}`);
    
    // If output exists, take it!
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (e) {
    console.log(`Furnace err:`, e.message);
  }
}

// 2. Check chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  if (contents.iron_ingot) {
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${contents.iron_ingot} iron_ingot from chest!`);
  }
  if (contents.raw_iron) {
    await lib.withdraw({ raw_iron: contents.raw_iron }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${contents.raw_iron} raw_iron from chest!`);
  }
} catch (e) {}

// If delta has raw_iron, put in furnace to smelt
if (lib.count('raw_iron') > 0) {
  console.log(`Delta holding ${lib.count('raw_iron')} raw iron, smelting...`);
  try {
    await lib.smelt('raw_iron', 'coal', lib.count('raw_iron'));
  } catch (e) {
    console.log('Smelt err:', e.message);
  }
}

console.log('Delta iron ingots:', lib.count('iron_ingot'));

// 3. Craft iron boots or helmet if ingots >= 4
if (tableBlock && lib.count('iron_ingot') >= 4) {
  if (!lib.count('iron_boots') && lib.count('iron_ingot') >= 4) {
    console.log('Crafting iron_boots...');
    const item = mcData.itemsByName.iron_boots;
    const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(250);
      await lib.stowCursor();
      console.log('Crafted iron_boots!');
    }
  }
  if (!lib.count('iron_helmet') && lib.count('iron_ingot') >= 5) {
    console.log('Crafting iron_helmet...');
    const item = mcData.itemsByName.iron_helmet;
    const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(250);
      await lib.stowCursor();
      console.log('Crafted iron_helmet!');
    }
  }
}

// 4. Equip armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Status: Gear ${JSON.stringify(lib.tools())}, offhand ${bot.inventory.slots[45]?.name}. Iron ingots: ${lib.count('iron_ingot')}`);
