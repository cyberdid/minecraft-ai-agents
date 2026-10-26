// programs/085-await-beta-smelt.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Wait for Beta to arrive in base or deposit raw iron
const chestPos = new Vec3(293, 72, -57);
const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);

let rawIronFound = 0;
for (let sec = 0; sec < 30; sec++) {
  // Check furnaces
  const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
  for (const f of furnaces) {
    try {
      const fw = await bot.openFurnace(bot.blockAt(f));
      const inI = fw.inputItem();
      const outI = fw.outputItem();
      if (inI || outI) {
        console.log(`Furnace at ${lib.fmt(f)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count}`);
      }
      if (outI && outI.count > 0) {
        await fw.takeOutput();
        console.log(`Took ${outI.count} ${outI.name}!`);
      }
      await fw.close();
    } catch (e) {}
  }

  // Check chest
  try {
    const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
    if (contents.iron_ingot) {
      await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
      console.log(`Withdrew ${contents.iron_ingot} iron ingots!`);
    }
    if (contents.raw_iron) {
      await lib.withdraw({ raw_iron: contents.raw_iron }, chestPos.x, chestPos.y, chestPos.z);
      console.log(`Withdrew ${contents.raw_iron} raw iron!`);
    }
  } catch (e) {}

  if (lib.count('raw_iron') > 0) {
    console.log(`Smelting ${lib.count('raw_iron')} raw iron...`);
    try {
      await lib.smelt('raw_iron', 'coal', lib.count('raw_iron'));
      console.log('Smelt complete!');
    } catch (e) {
      console.log('Smelt err:', e.message);
    }
  }

  if (lib.count('iron_ingot') >= 4) {
    console.log(`Have ${lib.count('iron_ingot')} iron ingots, ready to craft boots!`);
    break;
  }

  await sleep(1000);
}

console.log('Delta iron ingots:', lib.count('iron_ingot'));

// 2. Craft boots if >= 4
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
bot.chat(`delta: Status: Gear ${JSON.stringify(lib.tools())}, offhand ${bot.inventory.slots[45]?.name}.`);
