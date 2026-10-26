// programs/427-advance-to-fortress-entrance.js
console.log('=== Step: Advance to Nether Fortress entrance (45, 53, -116) ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Announce coordinates to team
bot.chat('beta: NETHER FORTRESS FOUND at (45, 53, -116)! Alpha and Delta, advance North along x=45 to meet at fortress!');

// 2. Advance towards fortress in stages
const fortressWaypoints = [
  new Vec3(55, 65, -75),
  new Vec3(50, 60, -95),
  new Vec3(46, 55, -110),
  new Vec3(45, 53, -116)
];

for (const wp of fortressWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing towards ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Nav note to ${lib.fmt(wp)}:`, err.message);
  }

  // Scan for Blazes and Wither Skeletons
  const hostiles = Object.values(bot.entities).filter(e => 
    ['blaze', 'wither_skeleton', 'ghast', 'magma_cube'].includes(e.name) &&
    bot.entity.position.distanceTo(e.position) < 25
  );
  if (hostiles.length > 0) {
    console.log(`Fortress mobs detected (${hostiles.length}):`);
    for (const h of hostiles) {
      console.log(`  ${h.name} at ${lib.fmt(h.position)}, dist=${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
    }
  }

  // Scan for Blaze Spawner within 20m
  const spawners = bot.findBlocks({
    matching: mcData.blocksByName.spawner?.id,
    maxDistance: 20,
    count: 2
  });
  if (spawners.length > 0) {
    console.log(`*** BLAZE SPAWNER LOCATED AT ${lib.fmt(spawners[0])}! ***`);
    bot.chat(`beta: BLAZE SPAWNER LOCATED AT ${lib.fmt(spawners[0])}!`);
    break;
  }
}

console.log(`Arrival status: pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}/20, Food=${bot.food}/20`);
bot.chat(`beta: At Nether Fortress threshold ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20. Ready to secure Blaze Rods!`);
