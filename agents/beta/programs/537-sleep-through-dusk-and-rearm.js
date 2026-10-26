// programs/537-sleep-through-dusk-and-rearm.js
console.log('=== Step: Synchronized Sleep with Alpha & Dawn Re-arm ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);

bot.clearControlStates();

// 1. Wait until tick 12541 for night
console.log(`Waiting for sleep time (current: ${bot.time.timeOfDay}, target: 12541)...`);
while (bot.time.timeOfDay < 12541 || bot.time.timeOfDay > 23458) {
  if (isCancelled()) break;
  await sleep(1000);
}

console.log(`Night reached! timeOfDay: ${bot.time.timeOfDay}. Finding bed...`);

// 2. Find available bed
const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 5, count: 5 });
console.log(`Found ${beds.length} beds:`, beds.map(p => lib.fmt(p)));

let slept = false;
for (const bp of beds) {
  const bBlock = bot.blockAt(bp);
  console.log(`Trying bed at ${lib.fmt(bp)}...`);
  try {
    await bot.sleep(bBlock);
    console.log(`SUCCESS: Sleeping in bed at ${lib.fmt(bp)}!`);
    slept = true;
    break;
  } catch (err) {
    console.log(`Bed at ${lib.fmt(bp)} error:`, err.message);
  }
}

if (slept) {
  console.log('Waiting for dawn...');
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    console.log(`Sleep check: timeOfDay=${bot.time.timeOfDay}, isSleeping=${bot.isSleeping}`);
    if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay >= 23458) {
      console.log('DAWN REACHED!');
      break;
    }
  }
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

// Lock spawn
try { await lib.setSpawn(); } catch (e) {}

// Check chests for any tools deposited by teammates
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    const items = c.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'bread', 'cooked_beef'].includes(it.name)) {
        try { await c.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await c.close();
  } catch (e) {}
}

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory at dawn:', inv);
console.log('Final timeOfDay:', bot.time.timeOfDay, 'HP:', bot.health);
bot.chat(`beta: Awake at dawn (time: ${bot.time.timeOfDay})! Geared: (${inv}). Ready for Nether mountain breach!`);

return {
  timeOfDay: bot.time.timeOfDay,
  inv
};
