// programs/367-enter-base-sleep-and-skip-night.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Walk remaining 35m into base shelter at (294, 72, -56)
console.log('Walking into base shelter at (294, 72, -56)...');
const toBase = [
  new Vec3(282, 69, -68),
  new Vec3(292, 72, -56),
  new Vec3(294, 72, -56)
];

for (const wp of toBase) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 10000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay);

// 2. Wait for bedtime tick 12542
while (!isCancelled() && bot.time.timeOfDay < 12542 && bot.time.timeOfDay >= 11000) {
  console.log(`Waiting for sleep tick 12542 (current: ${bot.time.timeOfDay})...`);
  await sleep(1000);
}

// 3. Locate bed and sleep
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 2 });
console.log(`Found ${beds.length} beds:`);
for (const b of beds) console.log(`  Bed at ${lib.fmt(b)}`);

if (beds.length > 0) {
  const bedBlock = bot.blockAt(beds[0]);
  console.log(`Sleeping in bed at ${lib.fmt(beds[0])}...`);
  try {
    await bot.sleep(bedBlock);
    bot.chat('delta: Sleeping in base bed to skip night!');
    await sleep(5000);
    try { await bot.wake(); } catch (e) {}
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// Ensure spawn is set
try {
  await lib.setSpawn();
  console.log('Spawn point locked!');
} catch (e) {}

console.log('Time after sleep:', bot.time.timeOfDay, 'pos:', lib.fmt(bot.entity.position));

// 4. Inspect base chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const i of items) {
      console.log(`  ${i.name} x${i.count}`);
      if (i.name.includes('sword') || i.name.includes('pickaxe') || i.name.includes('shield') || i.name === 'cobblestone' || i.name.includes('cooked') || i.name.includes('planks') || i.name === 'torch') {
        try { await chest.withdraw(i.type, null, i.count); } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {}
}

// Pickup drops inside base
try {
  const drops = await lib.pickup(6);
  console.log('Base ground drops:', drops);
} catch (e) {}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Dawn arrived! Spawn set at base bed. Time: ${bot.time.timeOfDay}. Ready to rearm for Nether!`);
