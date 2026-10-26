// programs/428-approach-fortress-base.js
console.log('=== Step: Approach fortress base at (45, y, -100..-116) ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan for all nether brick blocks within 40m
const fortressBlocks = bot.findBlocks({
  matching: b => b.name.includes('nether_brick'),
  maxDistance: 40,
  count: 20
});

console.log(`Fortress blocks detected within 40m: ${fortressBlocks.length}`);
if (fortressBlocks.length > 0) {
  console.log(`Nearest fortress block: ${lib.fmt(fortressBlocks[0])}`);
}

// 2. Advance towards the fortress pillar/base at (46, 26, -95) then (45, 30, -110)
const approachWps = [
  new Vec3(52, 26, -85),
  new Vec3(46, 26, -95),
  new Vec3(45, 28, -105)
];

for (const wp of approachWps) {
  if (isCancelled()) break;
  try {
    console.log(`Navigating to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Nav error to ${lib.fmt(wp)}:`, e.message);
  }
}

// 3. Scan for fortress mobs (Blaze, Wither Skeleton)
const mobs = Object.values(bot.entities).filter(e => 
  ['blaze', 'wither_skeleton', 'magma_cube'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 25
);
console.log(`Fortress mobs within 25m: ${mobs.length}`);
for (const m of mobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)}, dist=${bot.entity.position.distanceTo(m.position).toFixed(1)}m`);
}

// 4. Scan for Spawner
const spawner = bot.findBlocks({
  matching: mcData.blocksByName.spawner?.id,
  maxDistance: 30,
  count: 2
})[0];

if (spawner) {
  console.log(`*** BLAZE SPAWNER AT ${lib.fmt(spawner)}! ***`);
  bot.chat(`beta: BLAZE SPAWNER LOCATED AT ${lib.fmt(spawner)}!`);
}

bot.chat(`beta: Fortress base reached at ${lib.fmt(bot.entity.position)}! HP=${bot.health}/20, Food=${bot.food}/20. Preparing breach!`);
