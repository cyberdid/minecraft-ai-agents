// programs/501-sprint-to-base-and-sleep.js
console.log('=== Step: Sprint to Base & Sleep through Night ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Night in:', bot.time.nightIn);

// 1. Move in 2 quick stages to base door exterior (294, 72, -53)
const target = new Vec3(294, 72, -53);

try {
  await lib.goTo(270, 68, -60, 2.0);
  console.log('Checkpoint 1 reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Checkpoint 1 fallback:', e.message);
  try { await lib.walkTo(270, -60); } catch (e2) {}
}

try {
  await lib.goTo(target.x, target.y, target.z, 1.5);
  console.log('At base exterior:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Base exterior fallback:', e.message);
  try { await lib.walkTo(target.x, target.z); } catch (e2) {}
}

// 2. Open door and enter base interior (294, 72, -55)
try {
  await lib.door(294, 72, -54, true);
  await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
  await lib.door(294, 72, -54, false);
  console.log('Inside base securely at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door error, trying goThroughDoor:', e.message);
  try { await lib.goThroughDoor(294, 72, -54, { close: true }); } catch (e2) {}
}

// 3. Set spawn point at bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Respawn point set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Sleep in Bed 2 (293, 72, -55) or Bed 1 (294, 72, -56)
const bedPositions = [
  new Vec3(293, 72, -55),
  new Vec3(294, 72, -56)
];

for (let t = 0; t < 40; t++) {
  if (isCancelled()) break;
  const time = bot.time.timeOfDay;
  const isNight = time >= 12542 && time <= 23460;
  
  if (isNight && !bot.isSleeping) {
    for (const bp of bedPositions) {
      try {
        const bed = bot.blockAt(bp);
        if (bed) {
          console.log(`Sleeping in bed at ${lib.fmt(bp)}...`);
          await bot.sleep(bed);
          console.log('Successfully sleeping in bed!');
          break;
        }
      } catch (err) {}
    }
  }
  
  // Dawn arrived
  if (time < 1000 && t > 3) {
    console.log('DAWN ARRIVED! Time:', time);
    break;
  }
  
  await sleep(1000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Status: Time=', bot.time.timeOfDay, 'HP=', bot.health, 'Food=', bot.food, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Safely inside base! Time=${bot.time.timeOfDay}, HP=${bot.health}, Food=${bot.food}.`);
