// programs/508-sprint-to-base-rendezvous.js
console.log('=== Step: Sprint to Base & Team Rendezvous ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Night in:', bot.time.nightIn);

// 1. Move East to base door exterior (294, 72, -53)
const target = new Vec3(294, 72, -53);

try {
  await lib.goTo(250, 64, -70, 2.5);
  console.log('CP 1 reached:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.walkTo(250, -70); } catch (e2) {}
}

try {
  await lib.goTo(target.x, target.y, target.z, 1.5);
  console.log('Base exterior reached:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.walkTo(target.x, target.z); } catch (e2) {}
}

// 2. Open door and enter base interior
try {
  await lib.door(294, 72, -54, true);
  await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
  await lib.door(294, 72, -54, false);
  console.log('Inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54, { close: true }); } catch (e2) {}
}

// 3. Set bed spawn
try { await lib.setSpawn(); } catch (e) {}

// 4. Sleep in bed when night arrives (12542)
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 4, count: 2 });
for (let t = 0; t < 40; t++) {
  if (isCancelled()) break;
  const time = bot.time.timeOfDay;
  const isNight = time >= 12542 && time <= 23460;
  
  if (isNight && !bot.isSleeping) {
    for (const bp of beds) {
      try {
        await bot.sleep(bot.blockAt(bp));
        console.log('Sleeping peacefully in base bed!');
        break;
      } catch (err) {}
    }
  }
  
  if (time < 1000 && t > 3) {
    console.log('DAWN ARRIVED! Time:', time);
    break;
  }
  await sleep(1000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Team status: Time=', bot.time.timeOfDay, 'HP=', bot.health, 'Food=', bot.food);
bot.chat(`beta: At base with team! Time=${bot.time.timeOfDay}, HP=${bot.health}. Ready for mass shield & armor crafting!`);
