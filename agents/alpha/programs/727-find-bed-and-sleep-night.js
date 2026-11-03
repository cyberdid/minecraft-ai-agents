// programs/727-find-bed-and-sleep-night.js
console.log('=== Program 727: Find Bed & Sleep Night ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Scan for all bed blocks in base
const bedIds = bot.findBlocks({
  matching: b => b && b.name.includes('_bed'),
  maxDistance: 10,
  count: 6
});

console.log(`Found ${bedIds.length} bed blocks in base:`);
for (const bp of bedIds) {
  const b = bot.blockAt(bp);
  console.log(` - ${b.name} at ${lib.fmt(bp)} (occupied: ${b.getProperties()?.occupied})`);
}

// 2. Try sleeping in any unoccupied bed
let slept = false;
for (const bp of bedIds) {
  const b = bot.blockAt(bp);
  if (!b) continue;
  try {
    console.log(`Trying to sleep in bed at ${lib.fmt(bp)}...`);
    await bot.sleep(b);
    console.log('Successfully sleeping in bed!');
    bot.chat('alpha: Sleeping in base bed! Good night team!');
    slept = true;
    break;
  } catch (err) {
    console.log(`Bed at ${lib.fmt(bp)} sleep failed:`, err.message);
  }
}

// 3. If no bed was sleepable, check if we have wool/planks to craft another bed
if (!slept) {
  console.log('No bed currently slept in. Checking Base Chest for wool/beds...');
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const bedItem = chest.containerItems().find(i => i.name.includes('_bed'));
      if (bedItem) {
        await chest.withdraw(bedItem.type, null, 1);
        console.log(`Withdrew ${bedItem.name} from chest!`);
      }
      chest.close();
    } catch (e) {}
  }

  // If we have a bed in inventory, place it
  const invBed = bot.inventory.items().find(i => i.name.includes('_bed'));
  if (invBed) {
    console.log('Placing bed at (293, 72, -56)...');
    try {
      await lib.place(invBed.name, 293, 72, -56);
      const newBed = bot.blockAt(new Vec3(293, 72, -56));
      if (newBed) {
        await bot.sleep(newBed);
        console.log('Slept in newly placed bed!');
        bot.chat('alpha: Placed and slept in Bed 2 at (293, 72, -56)!');
        slept = true;
      }
    } catch (e) {
      console.log('Place bed error:', e.message);
    }
  }
}

// 4. Wait while sleeping or until dawn (timeOfDay < 1000)
const sleepStart = Date.now();
while (!checkCancelled() && bot.isSleeping && Date.now() - sleepStart < 30000) {
  await sleep(1000);
}

// 5. Wake up check
console.log('Post-sleep check: isSleeping =', bot.isSleeping, 'timeOfDay =', bot.time.timeOfDay, 'HP =', bot.health, 'Food =', bot.food);
if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay > 23000) {
  bot.chat(`alpha: Dawn has broken! Time: ${bot.time.timeOfDay}, HP: ${bot.health}/20, Food: ${bot.food}/20!`);
}

return {
  slept,
  isSleeping: bot.isSleeping,
  timeOfDay: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
