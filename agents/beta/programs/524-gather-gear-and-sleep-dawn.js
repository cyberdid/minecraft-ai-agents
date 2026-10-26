// programs/524-gather-gear-and-sleep-dawn.js
console.log('=== Step: Gather Logs, Mine Cobble, Craft Stone Gear, and Sleep to Dawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// 1. Exit base through door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log('Exiting base shelter...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
  try { await lib.goTo(294, 72, -52, 1); } catch (e2) {}
}

// 2. Collect 4 logs
console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4, 25);
  console.log('Logs collected! Count:', bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0));
} catch (e) {
  console.log('Log collect error:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
const logCount = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
if (logCount > 0) {
  try {
    await lib.craft('oak_planks', logCount * 4);
  } catch (e) {
    try { await lib.craft('oak_planks', 4); } catch (e2) {}
  }
  try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) await bot.equip(wpick, 'hand');

// 4. Collect 16 cobblestone
console.log('Collecting 16 cobblestone...');
try {
  await lib.collect('cobblestone', 16, 20);
  console.log('Cobblestone count:', bot.inventory.count(mcData.itemsByName.cobblestone.id));
} catch (e) {
  console.log('Cobblestone collect note:', e.message);
  const stones = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 12, count: 8 });
  for (const sp of stones) {
    if (bot.inventory.count(mcData.itemsByName.cobblestone.id) >= 16) break;
    try {
      await lib.goTo(sp.x, sp.y, sp.z, 2);
      await lib.dig(sp.x, sp.y, sp.z);
    } catch (e2) {}
  }
}

// 5. Craft stone pickaxe and stone sword
try {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe!');
} catch (e) {
  console.log('Stone pickaxe note:', e.message);
}

try {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword!');
} catch (e) {
  console.log('Stone sword note:', e.message);
}

// 6. Return inside base before night
console.log('Returning inside base...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Safely inside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
}

// 7. Wait for night and sleep
console.log(`Current timeOfDay: ${bot.time.timeOfDay}. Waiting for sleep time (>=12541)...`);
while (bot.time.timeOfDay < 12541 || bot.time.timeOfDay > 23458) {
  if (isCancelled()) break;
  await sleep(1000);
}

const bed = bot.findBlock({ matching: b => b.name.includes('bed'), maxDistance: 5 });
if (bed) {
  console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
  try {
    await bot.sleep(bed);
    console.log('Sleeping! Waiting for dawn...');
    for (let i = 0; i < 12; i++) {
      await sleep(1000);
      if (!bot.isSleeping && bot.time.timeOfDay < 1000) {
        console.log('Dawn reached! timeOfDay:', bot.time.timeOfDay);
        break;
      }
    }
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Final Inventory:', inv);
console.log('Final Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);

bot.chat(`beta: Re-armed with stone gear (${inv})! Spawn locked, ready for Nether advance.`);
return {
  inv,
  pos: bot.entity.position,
  timeOfDay: bot.time.timeOfDay
};
