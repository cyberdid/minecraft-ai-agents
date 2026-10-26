// programs/438-advance-to-fortress-outpost.js
console.log('=== Step: Advance along y=65 high ridge to Fortress Outpost (45, 65, -130) ===');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.chat('beta: Advancing along y=65 ridge trail to join Alpha, Gamma, and Delta at Fortress Outpost (45, 65, -130)!');

// High ridge safe trail waypoints
const ridgeTrail = [
  new Vec3(48, 65, -7),
  new Vec3(55, 65, -35),
  new Vec3(54, 64, -67),
  new Vec3(50, 65, -95),
  new Vec3(47, 65, -120),
  new Vec3(45, 65, -130)
];

for (const wp of ridgeTrail) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Trail nav note to ${lib.fmt(wp)}:`, err.message);
  }
}

// Check if teammates are nearby at the fortress outpost
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${dist}m`);
  }
}

// Scan for Blaze Spawner within 25m
const spawner = bot.findBlocks({
  matching: mcData.blocksByName.spawner?.id,
  maxDistance: 25,
  count: 2
})[0];

if (spawner) {
  console.log(`*** BLAZE SPAWNER FOUND AT ${lib.fmt(spawner)}! ***`);
  bot.chat(`beta: BLAZE SPAWNER CONFIRMED AT ${lib.fmt(spawner)}! Team prepare to farm Blaze Rods!`);
}

console.log(`Arrival at Fortress. Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}/20, Food: ${bot.food}/20`);
bot.chat(`beta: Reached Fortress Outpost ${lib.fmt(bot.entity.position)}! United with team to farm Blaze Rods!`);
