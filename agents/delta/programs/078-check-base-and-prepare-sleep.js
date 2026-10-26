// programs/078-check-base-and-prepare-sleep.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

bot.chat('delta: Inside base with 20 HP. Cooked chicken in chest for Alpha. Night in 140s, be ready to sleep!');

// 1. Check chest contents
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 2. Check all furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const inI = fw.inputItem();
    const outI = fw.outputItem();
    console.log(`Furnace at ${lib.fmt(f)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count}`);
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (err) {}
}

// 3. Check if we have >= 4 iron ingots to craft armor
if (chest.iron_ingot) {
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
}

console.log('Delta iron_ingot count:', lib.count('iron_ingot'));

const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  const tableBlock = bot.blockAt(table);
  const pieces = [
    { name: 'iron_boots', cost: 4 },
    { name: 'iron_helmet', cost: 5 },
    { name: 'iron_leggings', cost: 7 },
    { name: 'iron_chestplate', cost: 8 }
  ];
  for (const p of pieces) {
    if (!lib.count(p.name) && lib.count('iron_ingot') >= p.cost) {
      console.log(`Crafting ${p.name}...`);
      const item = mcData.itemsByName[p.name];
      const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
      if (rec) {
        await bot.craft(rec, 1, tableBlock);
        await sleep(250);
        await lib.stowCursor();
        console.log(`Crafted ${p.name}!`);
      }
    }
  }
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear:', JSON.stringify(lib.tools()));

// 4. Wait until sleep time (timeOfDay >= 12542) and sleep in Bed 2
console.log('Waiting for bedtime...');
while (!lib.time().canSleep && lib.time().secondsUntilNight > 5) {
  await sleep(1000);
}

if (lib.time().canSleep || lib.time().secondsUntilNight <= 5) {
  bot.chat('delta: Going to sleep in Bed 2 now! Everyone sleep!');
  try {
    await lib.sleepInBed();
    console.log('Delta is sleeping!');
    await sleep(5000);
  } catch (err) {
    console.log('Sleep attempt note:', err.message);
  }
}

console.log('Time after sleep attempt:', JSON.stringify(lib.time()));
bot.chat(`delta: Day ${Math.floor(bot.time.time / 24000)} tick ${bot.time.timeOfDay}. Health: ${bot.health}, Food: ${bot.food}.`);
