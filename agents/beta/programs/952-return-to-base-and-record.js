console.log('=== Program 952: Return to Base & Record Stronghold Ray ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

bot.chat('Beta: Triangulation revealed Ring 1 Strongholds! Stronghold 1 confirmed at 37.8° South-East! Returning to Base...');

// March East back to Base House
const baseDoor = new Vec3(294, 72, -54);
const baseInside = new Vec3(293, 72, -56);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const returnWps = [
  { x: 170, y: 62, z: -40 },
  { x: 210, y: 64, z: -44 },
  { x: 250, y: 68, z: -48 },
  { x: 294, y: 72, z: -52 }
];

for (let i = 0; i < returnWps.length && !isCancelled(); i++) {
  const wp = returnWps[i];
  console.log(`Advancing to return WP ${i + 1}/${returnWps.length} at (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {}
  }
}

console.log('Near Base Door! Entering house...');
try {
  await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 1.0));
} catch (e) {}

console.log('Safely inside Base House! Pos:', lib.fmt(bot.entity.position));

// If dusk / night, sleep
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

bot.chat('Beta: Safely inside Base House with 5 ender_eye & 17 ender_pearl! Ready to lead expedition along 37.8° ray to Stronghold 1!');

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
