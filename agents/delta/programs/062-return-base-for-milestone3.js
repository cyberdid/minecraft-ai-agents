// programs/062-return-base-for-milestone3.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Staged navigation back to base from (356, 42, -6)
const waypoints = [
  [335, -20],
  [310, -38],
  [294, -52]
];

for (const [wx, wz] of waypoints) {
  if (isCancelled()) break;
  console.log(`Heading to waypoint (${wx}, ${wz})...`);
  try {
    await lib.goToXZ(wx, wz, { timeoutMs: 20000 });
    console.log(`Reached waypoint, pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Waypoint (${wx}, ${wz}) note:`, err.message);
  }
}

// 2. Approach base door
const doorPos = new Vec3(294, 72, -54);
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1, { timeoutMs: 15000 });

// 3. Open door, enter, and close
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

// 4. Check chest for food brought by Alpha/Gamma
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const foodKeys = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
for (const fk of foodKeys) {
  if (chest[fk]) {
    console.log(`Withdrawing ${fk}...`);
    await lib.withdraw({ [fk]: Math.min(3, chest[fk]) }, chestPos.x, chestPos.y, chestPos.z);
    try {
      await lib.eat();
      console.log(`Ate ${fk}! Food now: ${bot.food}, Health: ${bot.health}`);
    } catch (e) {}
    break;
  }
}

// 5. Check furnaces for finished iron ingots
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
  } catch (err) {}
}

if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 6. Craft iron armor piece if ingots available
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
}

console.log('Final tools & armor:', JSON.stringify(lib.tools()));
bot.chat(`delta: Inside base with team! Food: ${bot.food}/20, Health: ${bot.health}/20. Iron ingots: ${lib.count('iron_ingot')}.`);
