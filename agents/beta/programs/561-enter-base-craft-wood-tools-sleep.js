// programs/561-enter-base-craft-wood-tools-sleep.js
console.log('=== Step: Enter Base Shelter, Craft Wood Tools, and Sleep ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Walk up to Base Camp door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log(`Walking up to base door at ${lib.fmt(doorPos)}...`);

try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2, { dig: true });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(doorPos.x, doorPos.y, doorPos.z, 2));
  } catch (e2) {}
}

console.log('Near door at:', lib.fmt(bot.entity.position));

// Enter base shelter
const doorBlock = bot.blockAt(doorPos) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 5 });
if (doorBlock) {
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
    console.log('Inside base at:', lib.fmt(bot.entity.position));
  } catch (e) {
    try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
  }
} else {
  try { await lib.goTo(292, 72, -56, 1); } catch (e) {}
}

// Ensure door is closed
if (doorBlock) {
  const d = bot.blockAt(doorBlock.position);
  if (d && d._properties && d._properties.open) {
    try { await lib.door(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z, false); } catch (e) {}
  }
}

// 2. Craft planks, sticks, wooden pickaxe inside base
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((a, b) => a + b.count, 0);
if (logs > 0) {
  try { await lib.craft('oak_planks', logs * 4); } catch (e) {}
  try { await lib.craft('stick', 4); } catch (e) {}
}

if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('SUCCESS: Crafted wooden_pickaxe!');
  } catch (e) {
    console.log('Wooden pickaxe craft note:', e.message);
  }
}

// Equip wooden pickaxe
const wpick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wpick) await bot.equip(wpick, 'hand');

// 3. Lock bed spawn point
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point locked!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Wait for nightfall (tick 12541) and sleep
console.log(`Current timeOfDay: ${bot.time.timeOfDay}. Waiting for sleep time (>=12541)...`);
while (bot.time.timeOfDay < 12541 || bot.time.timeOfDay > 23458) {
  if (isCancelled()) break;
  await sleep(1000);
}

console.log(`Nightfall reached! timeOfDay: ${bot.time.timeOfDay}. Finding bed...`);
const bed = bot.findBlock({ matching: b => b.name.includes('bed'), maxDistance: 5 });
if (bed) {
  console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
  try {
    await bot.sleep(bed);
    console.log('Sleeping! Waiting for dawn...');
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay >= 23458) {
        console.log('DAWN REACHED!');
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
console.log('Dawn inventory:', inv);
console.log('Final timeOfDay:', bot.time.timeOfDay, 'HP:', bot.health);
bot.chat(`beta: Safe in base! Geared: (${inv}). Ready to mine stone at dawn and enter Nether!`);

return {
  timeOfDay: bot.time.timeOfDay,
  pos: bot.entity.position,
  inv
};
