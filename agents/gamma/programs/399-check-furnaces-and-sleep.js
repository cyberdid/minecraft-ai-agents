// programs/399-check-furnaces-and-sleep.js
console.log('=== CHECK FURNACES & SLEEP TILL DAWN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Check all furnaces nearby
const furnaceIds = [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 8, count: 10 });
console.log(`Found ${furnaces.length} furnaces nearby.`);

for (const fPos of furnaces) {
  const fBlock = bot.blockAt(fPos);
  if (fBlock) {
    try {
      const furnace = await bot.openFurnace(fBlock);
      const out = furnace.outputItem();
      const inItem = furnace.inputItem();
      const fuel = furnace.fuelItem();
      console.log(`Furnace at ${lib.fmt(fPos)}: in=${inItem?.name}x${inItem?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${out?.name}x${out?.count}`);
      if (out) {
        await furnace.takeOutput();
        console.log(`Took output: ${out.name} x${out.count}`);
      }
      furnace.close();
    } catch (err) {
      console.log(`Error checking furnace at ${lib.fmt(fPos)}:`, err.message);
    }
  }
}

// 2. Check for any other chests or barrels
const containerIds = [mcData.blocksByName.chest.id, mcData.blocksByName.trapped_chest?.id, mcData.blocksByName.barrel?.id].filter(Boolean);
const containers = bot.findBlocks({ matching: containerIds, maxDistance: 8, count: 10 });
console.log(`Found ${containers.length} containers nearby.`);

// 3. Sleep protocol: wait for canSleep or night
let slept = false;
for (let i = 0; i < 40; i++) {
  const t = lib.time();
  if (t.timeOfDay >= 12542 || t.night || t.canSleep) {
    console.log(`Night/sleep time reached (tick ${t.timeOfDay}). Attempting to sleep...`);
    try {
      await lib.sleepInBed();
      console.log('Entered bed!');
      slept = true;
      // Wait for morning
      for (let s = 0; s < 15; s++) {
        await sleep(1000);
        const curT = lib.time();
        if (curT.phase === 'day' && curT.timeOfDay < 1000) {
          console.log(`Dawn arrived! Time: ${curT.timeOfDay}`);
          break;
        }
      }
      break;
    } catch (e) {
      console.log('sleepInBed note:', e.message);
    }
  }
  await sleep(1000);
}

// Ensure spawn is firmly set
try {
  await lib.setSpawn();
  console.log('Spawn set verified.');
} catch (e) {}

// If we got iron or food, equip or prepare
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
bot.chat(`gamma: Inside base ready. Night handled. Inv: ${Object.keys(lib.inv()).join(', ')}`);
