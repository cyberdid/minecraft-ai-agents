// programs/192-enter-portal-and-reach-nether.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Find the nether_portal block
const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 24,
  count: 5
});

if (portals.length === 0) {
  console.log('No nether_portal block found nearby! Walking towards (298, 73, -54)...');
  await lib.goTo(298, 73, -54, 1);
} else {
  const p = portals[0];
  console.log('Found nether_portal block at:', lib.fmt(p));
  console.log('Walking directly into nether_portal block...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (err) {
    console.log('GoalBlock error, using lib.goTo:', err.message);
    await lib.goTo(p.x, p.y, p.z, 0);
  }
}

// 2. Wait for dimension change
const startDim = bot.game.dimension;
console.log('Standing in portal, waiting for teleport from:', startDim);
bot.chat('delta: Standing in portal, transiting to Nether...');

for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! New dimension: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos after transit:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 3. If in Nether, advance along East Ridge trail
if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Advancing to join Gamma at (44, 65, -141).`);
  await lib.equipWeapon();

  const ridgeWaypoints = [
    new Vec3(63, 64, -5),
    new Vec3(62, 66, -30),
    new Vec3(61, 67, -59),
    new Vec3(54, 65, -90),
    new Vec3(44, 66, -127),
    new Vec3(44, 65, -135),
    new Vec3(44, 65, -141)
  ];

  for (const wp of ridgeWaypoints) {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
      console.log(`Reached ${lib.fmt(wp)}! Pos: ${lib.fmt(bot.entity.position)}`);
    } catch (err) {
      console.log(`Path note at ${lib.fmt(wp)}:`, err.message);
    }

    // Defend against any aggressive hostile mobs
    const hostiles = lib.hostiles(10);
    for (const h of hostiles) {
      if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
        console.log(`Defending against ${h.name} at dist ${h.dist}...`);
        try {
          await lib.fight(5, 5);
        } catch (e) {}
      }
    }
  }

  console.log('Nether final pos:', lib.fmt(bot.entity.position));
  if (bot.entity.position.z <= -127) {
    bot.chat(`delta: Inside fortified hallway at ${lib.fmt(bot.entity.position)} with Gamma! Ready with 34 cobble.`);
  }
}
