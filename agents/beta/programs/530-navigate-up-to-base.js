// programs/530-navigate-up-to-base.js
console.log('=== Step: Navigate up to Base from (306, 68, -65) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.pathfinder.stop();
await sleep(200);

// Use default movements
const defaultMove = new Movements(bot, mcData);
defaultMove.canDig = true;
defaultMove.allow1by1towers = true;
bot.pathfinder.setMovements(defaultMove);

const target = new Vec3(294, 72, -54);
console.log(`Navigating to ${lib.fmt(target)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 2));
  console.log(`Arrived near door: ${lib.fmt(bot.entity.position)}`);
} catch (e) {
  console.log('Pathfinder error:', e.message);
  // Try stage waypoints
  const waypoints = [
    new Vec3(302, 71, -55),
    new Vec3(296, 72, -54),
    new Vec3(293, 72, -55)
  ];
  for (const wp of waypoints) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
      console.log(`Reached intermediate wp ${lib.fmt(wp)}: ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {
      console.log(`Failed intermediate wp ${lib.fmt(wp)}:`, e2.message);
    }
  }
}

// Enter door
const doorBlock = bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 5 });
if (doorBlock) {
  console.log('Entering door at:', lib.fmt(doorBlock.position));
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
  } catch (e) {
    console.log('goThroughDoor note:', e.message);
  }
}

console.log('Inside pos:', lib.fmt(bot.entity.position));
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16m:', hostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');
