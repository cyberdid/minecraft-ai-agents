// programs/066-sleep-and-craft-boots.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

bot.chat('delta: In base at Bed 2! Waiting for 12542 to sleep with team!');

// 1. Wait for tick 12542
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

// 2. Sleep in Bed 2
console.log('Sleeping in Bed 2 at (293, 72, -55)...');
const bed2 = bot.blockAt(new Vec3(293, 72, -55));
if (bed2 && bed2.name.includes('bed')) {
  try {
    await bot.sleep(bed2);
    console.log('Sleeping peacefully in Bed 2!');
    await sleep(6000);
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Time after sleep:', JSON.stringify(lib.time()));

// 3. Morning: Withdraw 4 iron ingots from chest
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ iron_ingot: 2 }, chestPos.x, chestPos.y, chestPos.z);
} catch (e) {
  console.log('Withdraw note:', e.message);
}

console.log('Iron ingots in delta inv:', lib.count('iron_ingot'));

// 4. Craft iron_boots
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

// 5. Equip boots and armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Tools and armor equipped:', JSON.stringify(lib.tools()));
console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Morning! Equipped: ${JSON.stringify(lib.tools())}. Ready for Nether expedition!`);
