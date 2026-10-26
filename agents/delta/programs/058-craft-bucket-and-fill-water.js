// programs/058-craft-bucket-and-fill-water.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft bucket from 3 iron ingots
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 3) {
  const tableBlock = bot.blockAt(table);
  const bucketItem = mcData.itemsByName.bucket;
  const rec = bot.recipesFor(bucketItem.id, null, 1, tableBlock)[0];
  if (rec) {
    console.log('Crafting bucket...');
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted bucket! Have bucket:', lib.count('bucket'));
  }
}

// 2. Step outside base door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294.5, -50);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Outside at:', lib.fmt(bot.entity.position));

// 3. Fill bucket with water
if (lib.count('bucket') > 0 && !lib.count('water_bucket')) {
  console.log('Filling bucket with water...');
  try {
    await lib.fillBucket('water');
    console.log('Water bucket filled!');
  } catch (e) {
    console.log('fillBucket note:', e.message);
  }
}

// 4. Return inside base
console.log('Returning inside base...');
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);
if (door && !bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Water bucket ready (${lib.count('water_bucket')})! Health: ${bot.health}/20, Food: ${bot.food}/20.`);
