// programs/474-sleep-in-base.js
globalThis.isProgramCancelled = () => false;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta at:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay);

// 1. Walk up from (302.5, 68.2, -42.0) to surface (302, 71, -44)
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 1.0));
} catch (e) {
  try {
    await bot.lookAt(new Vec3(302, 71, -44), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  } catch (e2) {}
}

// 2. Walk to outside door (294, 72, -53)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 0.8));
} catch (e) {
  try { await lib.goToXZ(294, -53, { timeoutMs: 5000 }); } catch (e2) {}
}

console.log('Outside base door at:', lib.fmt(bot.entity.position));

// 3. Enter base through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

// 4. Stand at Bed 2 (293, 72, -56)
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.5));
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 5. Equip fresh sword and shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat('delta: Safe inside Base shelter (293, 72, -56)! Ready to sleep.');

// 6. Wait for sleep time (12542) and sleep in bed
const sleepStart = Date.now();
while (Date.now() - sleepStart < 25000) {
  if (bot.isSleeping) {
    console.log('Delta is currently sleeping!');
    break;
  }
  const curTime = bot.time.timeOfDay;
  if (curTime >= 12542 && curTime <= 23460) {
    const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 4 });
    if (bed) {
      try {
        console.log('Attempting sleep at bed:', lib.fmt(bed.position));
        await bot.sleep(bed);
        bot.chat('delta: In Bed 2 sleeping to skip night.');
        console.log('Successfully sleeping!');
        break;
      } catch (e) {
        console.log('Sleep attempt note:', e.message);
      }
    }
  }
  await sleep(1000);
}

return {
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  sleeping: bot.isSleeping,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
