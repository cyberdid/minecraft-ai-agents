// programs/525-escape-creeper-enter-base-sleep.js
console.log('=== Step: Escape Creeper, Enter Base Shelter, and Sleep ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Stop any lingering pathfinder
bot.pathfinder.stop();
await sleep(100);

// Hostiles
const hostiles = lib.hostiles(16);
console.log('Hostiles near:', hostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

// 1. Sprint towards base door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log(`Heading quickly to base door at ${lib.fmt(doorPos)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(doorPos.x, doorPos.y, doorPos.z, 2));
} catch (e) {
  console.log('Pathfinder note, sprinting directly to door:', e.message);
  await bot.lookAt(doorPos.offset(0, 1, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  bot.setControlState('jump', true);
  await sleep(2500);
  bot.clearControlStates();
}

console.log('At door vicinity:', lib.fmt(bot.entity.position));

// 2. Go through door into base
const doorBlock = bot.blockAt(doorPos) || bot.blockAt(doorPos.offset(0, 1, 0)) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 4 });
if (doorBlock) {
  console.log(`Entering base through door at ${lib.fmt(doorBlock.position)}...`);
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
    try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
  }
} else {
  console.log('No door found, walking inside base...');
  try { await lib.goTo(292, 72, -56, 1); } catch (e) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Ensure door is closed
if (doorBlock) {
  const d = bot.blockAt(doorBlock.position);
  if (d && d._properties && d._properties.open) {
    console.log('Closing open door...');
    try { await lib.door(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z, false); } catch (e) {}
  }
}

// 4. Set bed spawn point
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point set!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 5. Check time and sleep
console.log(`Current timeOfDay: ${bot.time.timeOfDay}. Waiting for night (>=12541)...`);
while (bot.time.timeOfDay < 12541 || bot.time.timeOfDay > 23458) {
  if (isCancelled()) break;
  await sleep(1000);
}

console.log(`Night reached! timeOfDay: ${bot.time.timeOfDay}. Attempting to sleep...`);
const bed = bot.findBlock({ matching: b => b.name.includes('bed'), maxDistance: 5 });
if (bed) {
  try {
    await bot.sleep(bed);
    console.log('Sleeping! Waiting 8s for dawn...');
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

console.log('Final pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);
bot.chat(`beta: Safe inside base, bed spawn set! Time: ${bot.time.timeOfDay}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  timeOfDay: bot.time.timeOfDay
};
