// programs/200-manage-furnaces-and-check-night.js
console.log('--- Night Protocol & Base Management ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Inspect all 3 furnaces, take output, and smelt all raw iron
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

let totalIronIngots = 0;
for (const pos of furnacePositions) {
  const block = bot.blockAt(pos);
  if (block && block.name === 'furnace') {
    try {
      const furn = await bot.openFurnace(block);
      const inItem = furn.inputItem();
      const fuelItem = furn.fuelItem();
      const outItem = furn.outputItem();
      console.log(`Furnace at ${lib.fmt(pos)}: input=${inItem?.name}x${inItem?.count}, fuel=${fuelItem?.name}x${fuelItem?.count}, output=${outItem?.name}x${outItem?.count}`);
      
      if (outItem) {
        console.log(`Taking output ${outItem.name} x${outItem.count}...`);
        await furn.takeOutput();
      }

      // If furnace is empty and we have raw iron, load it!
      if (!furn.inputItem() && lib.count('raw_iron') > 0) {
        const toSmelt = Math.min(lib.count('raw_iron'), 4);
        if (!furn.fuelItem() && lib.count('coal') > 0) {
          await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
        }
        await furn.putInput(mcData.itemsByName.raw_iron.id, null, toSmelt);
        console.log(`Loaded ${toSmelt} raw_iron into furnace ${lib.fmt(pos)}.`);
      }
      furn.close();
    } catch (e) {
      console.log(`Furnace error at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// 2. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    console.log(`Beta pos: ${p.entity ? lib.fmt(p.entity.position) : 'unknown'}, held: ${p.entity?.heldItem?.name}`);
  }
}

// 3. Ask Beta about wool in chat
bot.chat('beta: Chest has 2 gray_wool and 2 light_gray_wool. Do you have 1 more gray or light_gray wool in your inventory so we can craft Bed 2?');

// 4. Wait for night and check sleep
console.log('Current time info:', JSON.stringify(lib.time()));

while (!isCancelled() && bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 10000) {
  console.log(`Waiting for sunset/sleep: tick ${bot.time.timeOfDay} / 12542...`);
  await sleep(3000);
}

if (lib.time().canSleep) {
  console.log('Can sleep now! Attempting sleepInBed...');
  bot.chat('beta: Tick 12542! Bedtime.');
  try {
    await lib.sleepInBed();
    console.log('Woke up! Sleep completed. Time:', JSON.stringify(lib.time()));
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

console.log('Finished 200. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', JSON.stringify(lib.time()));
