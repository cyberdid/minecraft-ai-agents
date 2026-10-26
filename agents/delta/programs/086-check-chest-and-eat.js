// programs/086-check-chest-and-eat.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const chestPos = new Vec3(293, 72, -57);
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
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (err) {}
}

// 2. Check chest
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest read err:', e.message);
}

// 3. Eat food if available in chest
const foodTypes = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
for (const ft of foodTypes) {
  if (chest[ft] && chest[ft] > 0 && bot.food < 18) {
    const toEat = Math.min(2, chest[ft]);
    console.log(`Withdrawing ${toEat} ${ft}...`);
    await lib.withdraw({ [ft]: toEat }, chestPos.x, chestPos.y, chestPos.z);
    while (lib.count(ft) > 0 && bot.food < 18) {
      await lib.eat();
      await sleep(300);
      console.log(`Ate ${ft}, food now: ${bot.food}`);
    }
    break;
  }
}

// 4. Check for iron ingots / raw iron
if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  console.log(`Withdrew ${chest.iron_ingot} iron_ingot from chest!`);
}
if (chest.raw_iron) {
  await lib.withdraw({ raw_iron: chest.raw_iron }, chestPos.x, chestPos.y, chestPos.z);
  console.log(`Withdrew ${chest.raw_iron} raw_iron from chest!`);
}

// Smelt raw iron if we have it
if (lib.count('raw_iron') > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw_iron...`);
  try {
    await lib.smelt('raw_iron', 'coal', lib.count('raw_iron'));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log('Delta iron ingots:', lib.count('iron_ingot'));

// 5. Craft iron boots if >= 4
if (tableBlock && lib.count('iron_ingot') >= 4 && !lib.count('iron_boots')) {
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

await lib.equipArmor();
await lib.equipWeapon();

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Status: Health ${bot.health}/20, Food ${bot.food}/20. Gear: ${JSON.stringify(lib.tools())}, offhand: ${bot.inventory.slots[45]?.name}.`);
