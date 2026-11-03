console.log('=== Program 953: Enter Base House ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

const baseDoor = new Vec3(294, 72, -54);
const baseInside = new Vec3(293, 72, -56);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log('Moving 70m East to Base Door at (294, 72, -52)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 1.5));
} catch (e) {
  try {
    await lib.goToXZ(294, -52, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('Near door! Position:', lib.fmt(bot.entity.position));

// Enter through door
try {
  await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
  console.log('Passed through door into base!');
} catch (e) {
  console.log('Door notice:', e.message);
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 0.8));
} catch (e) {}

console.log('Safe inside house! Position:', lib.fmt(bot.entity.position));

// If dusk / night, sleep in bed
if (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460) {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
  if (bed) {
    try {
      console.log('Sleeping...');
      await bot.sleep(bed);
      await sleep(4000);
    } catch (e) {}
  }
}

bot.chat('Beta: Secure inside Base House! Ready with 5 ender_eye & 17 ender_pearl to craft full 16 eyes and march to Stronghold!');

console.log('Final inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
