// programs/050-return-base-eat-and-craft-iron-armor.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Travel back to base at (294, 72, -52)
console.log('Returning to base...');
await lib.goToXZ(294, -52);
console.log('Arrived near base at:', lib.fmt(bot.entity.position));

// 2. Approach and open base door
const doorPos = new Vec3(294, 72, -54);
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);

const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Put raw_iron into the furnace to smelt
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} fuel=${fw.fuelItem()?.name}x${fw.fuelItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    
    // Put raw iron if we have it
    if (lib.count('raw_iron') > 0 && (!fw.inputItem() || fw.inputItem().name === 'raw_iron')) {
      await fw.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      console.log('Put raw_iron to smelt!');
    }
    
    // Take output if iron ingots or cooked food
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

// 4. Check base chest for cooked food and iron ingots
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const foodTypes = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
for (const ft of foodTypes) {
  if (chest[ft]) {
    await lib.withdraw({ [ft]: Math.min(4, chest[ft]) }, chestPos.x, chestPos.y, chestPos.z);
    break;
  }
}

if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
}

// Eat food to heal
try {
  await lib.eat();
  console.log('Ate food! Food now:', bot.food, 'Health now:', bot.health);
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 5. Craft full iron armor pieces
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

// 6. Equip armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Delta inventory now:', JSON.stringify(lib.inv()));
console.log('Delta armor & tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Base update: Food: ${bot.food}/20, Health: ${bot.health}/20, Iron ingots: ${lib.count('iron_ingot')}. Armor equipped!`);
