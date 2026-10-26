// programs/065-wait-smelt-craft-boots-and-sleep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Wait 20s for the remaining 2 iron ingots to finish smelting
console.log('Waiting 20s for remaining 2 iron ingots to finish smelting...');
await sleep(20000);

// 2. Open furnace and retrieve iron ingots
const furnacePos = new Vec3(295, 72, -55);
try {
  const fw = await bot.openFurnace(bot.blockAt(furnacePos));
  console.log(`Furnace: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
  if (fw.outputItem()) {
    await fw.takeOutput();
    console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
  }
  await fw.close();
} catch (e) {
  console.log('Furnace error:', e.message);
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 3. Craft iron_boots if we have >= 4 iron ingots
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots at table...');
  const tableBlock = bot.blockAt(table);
  const bootsItem = mcData.itemsByName.iron_boots;
  const rec = bot.recipesFor(bootsItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted iron_boots! Have boots:', lib.count('iron_boots'));
  }
}

// 4. Equip armor
await lib.equipArmor();
await lib.equipWeapon();
console.log('Tools and armor equipped:', JSON.stringify(lib.tools()));

// 5. Wait for sleep window (tick 12542)
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

// 6. Sleep in Bed 2
console.log('Sleeping in Bed 2...');
const bed2 = bot.blockAt(new Vec3(293, 72, -55));
if (bed2 && bed2.name.includes('bed')) {
  try {
    await bot.sleep(bed2);
    console.log('Sleeping in Bed 2!');
    await sleep(5000);
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

console.log('Time after sleep:', JSON.stringify(lib.time()));
bot.chat(`delta: Iron boots equipped! Slept in Bed 2. Ready for Nether expedition!`);
