// programs/087-smelt-and-craft-iron-boots.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const f1Pos = new Vec3(295, 72, -55);
const f2Pos = new Vec3(295, 72, -57);
const tablePos = new Vec3(295, 72, -56);
const chestPos = new Vec3(293, 72, -57);

// 1. Put fuel into Furnace 1 at (295, 72, -55)
const f1Block = bot.blockAt(f1Pos);
const fw1 = await bot.openFurnace(f1Block);
console.log('F1 in:', fw1.inputItem()?.name, 'x', fw1.inputItem()?.count);
console.log('F1 fuel:', fw1.fuelItem()?.name, 'x', fw1.fuelItem()?.count);

if (!fw1.fuelItem() && lib.count('coal') > 0) {
  const coalId = mcData.itemsByName.coal.id;
  await fw1.putFuel(coalId, null, 1);
  console.log('Added coal to F1!');
}
await fw1.close();

// 2. Wait for smelting to finish (6 items * 10s = ~60s)
console.log('Waiting for smelting to complete...');
for (let sec = 0; sec < 15; sec++) {
  await sleep(4000);
  const fw = await bot.openFurnace(f1Block);
  const inI = fw.inputItem();
  const outI = fw.outputItem();
  console.log(`Smelt progress (${(sec+1)*4}s): in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count}`);
  if (outI && outI.count >= 4) {
    // If we have at least 4 ingots, we can take them now to craft boots!
    await fw.takeOutput();
    console.log(`Took ${outI.count} ${outI.name}!`);
    await fw.close();
    break;
  }
  await fw.close();
  if (!inI && (!outI || outI.count === 0)) break;
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 3. Craft iron_boots at crafting table
const tableBlock = bot.blockAt(tablePos);
if (tableBlock && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots at table...');
  const bootsItem = mcData.itemsByName.iron_boots;
  const rec = bot.recipesFor(bootsItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted iron_boots successfully!');
  }
}

// 4. Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();

// Check if any more smelted ingots to collect
try {
  const fwCheck = await bot.openFurnace(f1Block);
  const outCheck = fwCheck.outputItem();
  if (outCheck && outCheck.count > 0) {
    await fwCheck.takeOutput();
    console.log(`Took additional ${outCheck.count} iron_ingot!`);
  }
  await fwCheck.close();
} catch (e) {}

// Deposit remaining iron ingots in chest for Beta
if (lib.count('iron_ingot') > 0) {
  console.log(`Depositing ${lib.count('iron_ingot')} spare iron ingots in chest for Beta...`);
  try {
    await lib.deposit({ iron_ingot: lib.count('iron_ingot') }, chestPos.x, chestPos.y, chestPos.z);
  } catch (e) {}
}

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Offhand item:', bot.inventory.slots[45]?.name);
console.log('Final inventory:', JSON.stringify(lib.inv()));

bot.chat(`delta: Equipped gear: ${JSON.stringify(lib.tools())}, offhand: ${bot.inventory.slots[45]?.name}! Milestone 3 iron boots & shield active!`);
