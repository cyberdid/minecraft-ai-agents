// programs/057-coordinated-night-sleep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

bot.chat('delta: All 4 players in base! Waiting for 12542 to sleep in Bed 2!');

// 1. Wait until tick 12542
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

// 2. Sleep in Bed 2
console.log('Sleeping in Bed 2 at (293, 72, -55)...');
const bed2 = bot.blockAt(new Vec3(293, 72, -55));
if (bed2 && bed2.name.includes('bed')) {
  try {
    await bot.sleep(bed2);
    console.log('Sleeping in Bed 2!');
    await sleep(6000);
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Time after sleep:', JSON.stringify(lib.time()));

// 3. Morning check
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents in morning:', JSON.stringify(chest));

const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {}
}

console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Morning team! Iron ingots in inv: ${lib.count('iron_ingot')}. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
