// programs/424-test-march-wp0-2.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Look for fire / soul fire nearby
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
const fires = bot.findBlocks({ matching: fireIds, maxDistance: 16, count: 10 });
console.log(`Found ${fires.length} fire blocks nearby:`);
for (const f of fires) {
  const b = bot.blockAt(f);
  console.log(`  ${b.name} at ${lib.fmt(f)} dist: ${bot.entity.position.distanceTo(f).toFixed(1)}m`);
}

// 2. Extinguish any fires within 5m
for (const f of fires) {
  if (bot.entity.position.distanceTo(f) <= 5) {
    console.log(`Extinguishing fire at ${lib.fmt(f)}...`);
    try {
      await bot.dig(bot.blockAt(f));
      console.log('Extinguished!');
    } catch (e) {
      console.log('Extinguish error:', e.message);
    }
  }
}

// 3. Configure pathfinder with fire avoidance
const moves = new Movements(bot, mcData);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// 4. Test stepping through waypoints 0, 1, 2
const testWps = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 }
];

for (let i = 0; i < testWps.length; i++) {
  const wp = testWps[i];
  console.log(`Navigating to WP ${i} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i}! Current pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Failed WP ${i}:`, e.message);
    break;
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
