// programs/051-eat-and-staged-return.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Eat raw chicken to prevent starvation
if (lib.inv().chicken || lib.inv().raw_chicken) {
  console.log('Eating raw chicken to sustain hunger...');
  try {
    await lib.eat();
    console.log('Ate! Food now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// 2. Return to base in 25-block stages to prevent A* think timeout
const waypoints = [
  [360, -35],
  [335, -40],
  [310, -46],
  [294, -52]
];

for (const [wx, wz] of waypoints) {
  if (isCancelled()) break;
  console.log(`Heading to waypoint (${wx}, ${wz})...`);
  try {
    await lib.goToXZ(wx, wz, { timeoutMs: 15000 });
    console.log(`Reached waypoint, pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Waypoint (${wx}, ${wz}) note:`, err.message);
  }
}

// 3. Approach and enter base door
const doorPos = new Vec3(294, 72, -54);
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1, { timeoutMs: 15000 });

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

// 4. Put raw iron into furnace
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (lib.count('raw_iron') > 0 && (!fw.inputItem() || fw.inputItem().name === 'raw_iron')) {
      await fw.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      console.log('Added raw iron to furnace!');
    }
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

// 5. Check base chest for cooked food and iron ingots
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

// Eat cooked food
try {
  await lib.eat();
  console.log('Ate cooked food! Food now:', bot.food, 'Health now:', bot.health);
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 6. Craft iron armor
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
  await lib.equipWeapon();
  console.log('Armor equipped! Tools:', JSON.stringify(lib.tools()));
}

console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`delta: Back at base! Food: ${bot.food}/20, Health: ${bot.health}/20. Iron ingots: ${lib.count('iron_ingot')}.`);
