// programs/430-sprint-base-and-set-spawn.js
console.log('=== SPRINT TO BASE, SET SPAWN & SLEEP TO DAWN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Sprint directly to base (293, 72, -55)
console.log('Sprinting across surface to base (293, 72, -55)...');
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
moves.maxDropDown = 4;
bot.pathfinder.setMovements(moves);

try {
  await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 50000 });
} catch (e) {
  console.log('Sprint goTo note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 3));
  } catch (e2) {}
}

console.log('Arrived near base! Pos:', lib.fmt(bot.entity.position));

// 2. Enter base through door (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 3. Set spawn point in base
try {
  await lib.setSpawn();
  console.log('SUCCESS: Spawn point permanently set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Sleep loop until dawn
const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
console.log('Bed found nearby:', bed ? lib.fmt(bed.position) : 'none');

const deadline = Date.now() + 100000;
while (Date.now() < deadline && !isCancelled()) {
  const t = bot.time.timeOfDay;
  if (t < 1000 || t > 23500) {
    console.log('Dawn arrived! Time:', t);
    break;
  }
  const canSleep = t >= 12542 && t <= 23460;
  if (canSleep && bed) {
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bed);
      console.log('Sleeping!');
      await sleep(5000);
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(1000);
}

console.log('Dawn reached! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
return { pos: bot.entity.position, hp: bot.health, time: bot.time.timeOfDay };
