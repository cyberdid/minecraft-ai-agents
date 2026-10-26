// programs/264-ascend-cave.js
console.log('=== Program 264: Ascend Cave towards Surface ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'hp:', bot.health);

const movements = new Movements(bot, mcData);
movements.canDig = false;
movements.allow1by1towers = false;
movements.allowParkour = true;
bot.pathfinder.setMovements(movements);

// Let's test reaching intermediate heights in the cave
const targets = [
  new Vec3(335, 24, -70),
  new Vec3(336, 30, -70),
  new Vec3(336, 40, -72),
  new Vec3(336, 50, -73),
  new Vec3(336, 58, -73)
];

for (const t of targets) {
  if (isCancelled()) break;
  console.log(`Trying to path to near ${lib.fmt(t)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(t.x, t.y, t.z, 2));
    console.log(`Reached near ${lib.fmt(t)}! Current pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Failed to reach ${lib.fmt(t)}: ${e.message}`);
    // If we failed, let's break and see where we are
    break;
  }
}

console.log('Current alpha pos:', lib.fmt(bot.entity.position));
// Also check Beta
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
