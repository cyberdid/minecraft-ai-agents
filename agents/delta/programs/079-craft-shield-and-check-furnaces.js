// programs/079-craft-shield-and-check-furnaces.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);
if (!tableBlock) {
  console.log('Table not found at', lib.fmt(tablePos));
}

// 1. Craft planks from birch_log if needed
if (lib.count('*_planks') < 6 && lib.count('birch_log') > 0) {
  console.log('Crafting planks from birch_log...');
  const planksItem = mcData.itemsByName.birch_planks;
  const rec = bot.recipesFor(planksItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Planks count now:', lib.count('*_planks'));
  }
}

// 2. Craft shield if we don't have one and have 6 planks + 1 iron_ingot
if (lib.count('shield') === 0 && lib.count('*_planks') >= 6 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield at table...');
  const shieldItem = mcData.itemsByName.shield;
  const rec = bot.recipesFor(shieldItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted shield!');
  }
}

// 3. Check furnaces for smelted iron
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const inI = fw.inputItem();
    const outI = fw.outputItem();
    const fuelI = fw.fuelItem();
    console.log(`Furnace at ${lib.fmt(f)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count} fuel=${fuelI?.name}x${fuelI?.count}`);
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log(`Furnace error:`, err.message);
  }
}

// Check chest for iron ingots
const chestPos = new Vec3(293, 72, -57);
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
  if (chest.iron_ingot) {
    await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${chest.iron_ingot} iron_ingot from chest!`);
  }
} catch (e) {}

console.log('Total iron ingots in delta inventory:', lib.count('iron_ingot'));

// 4. Craft armor pieces
const armorPieces = [
  { name: 'iron_boots', cost: 4 },
  { name: 'iron_helmet', cost: 5 },
  { name: 'iron_leggings', cost: 7 },
  { name: 'iron_chestplate', cost: 8 }
];

for (const p of armorPieces) {
  if (!lib.count(p.name) && lib.count('iron_ingot') >= p.cost) {
    console.log(`Crafting ${p.name}...`);
    const item = mcData.itemsByName[p.name];
    const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(250);
      await lib.stowCursor();
      console.log(`Crafted ${p.name}!`);
    }
  }
}

// 5. Equip all armor and shield
await lib.equipArmor();
await lib.equipWeapon();

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Delta inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Gear equipped: ${JSON.stringify(lib.tools())}. Iron ingots left: ${lib.count('iron_ingot')}`);
