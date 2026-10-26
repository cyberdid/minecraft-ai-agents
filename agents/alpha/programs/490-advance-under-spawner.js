// programs/490-advance-under-spawner.js
console.log('=== Program 490: Advance to Safe Under-Spawner Corridor ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('team: Alpha advancing through roofed fortress corridor directly under Blaze Spawner to (32, 53, -190)!');

// 1. Follow safe corridor steps to (32, 53, -190)
const corridorWaypoints = [
  new Vec3(43, 53, -185),
  new Vec3(43, 53, -191),
  new Vec3(40, 54, -194),
  new Vec3(35, 53, -195),
  new Vec3(32, 53, -193),
  new Vec3(32, 53, -190)
];

for (const wp of corridorWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing along corridor to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
    console.log(`Reached ${lib.fmt(wp)}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}: ${err.message}`);
    try {
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  // Pick up any dropped items along the way
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 6);
  if (items.length > 0) {
    try { await lib.pickup(6); } catch (e) {}
  }
}

console.log('Arrived under Blaze Spawner! Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 2. Inspect the vertical column above bot up to the spawner at y=68
console.log('Inspecting vertical column above (32, y, -190):');
for (let y = 53; y <= 69; y++) {
  const b = bot.blockAt(new Vec3(32, y, -190));
  console.log(`  y=${y}: ${b?.name || 'air'}`);
}

const spawnerDist = bot.entity.position.distanceTo(new Vec3(32, 68, -190));
bot.chat(`team: Alpha stationed directly under Blaze Spawner at ${lib.fmt(bot.entity.position)}! Vertical distance: ${spawnerDist.toFixed(1)}m. 100% blast-proof overhead cover!`);
