// programs/197-transit-portal-and-reach-mountain.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Tower/pathfind up to Nether portal at (298, 73, -54)
if (bot.game.dimension !== 'minecraft:the_nether' && !bot.game.dimension.includes('nether')) {
  console.log('Ascending to portal at (298, 73, -54)...');
  try {
    await lib.goTo(298, 73, -54, 1);
  } catch (err) {
    console.log('goTo portal error:', err.message);
  }

  // Find nether_portal block
  const portals = bot.findBlocks({
    matching: b => b.name === 'nether_portal',
    maxDistance: 12,
    count: 5
  });

  if (portals.length > 0) {
    const p = portals[0];
    console.log('Stepping into nether_portal block at:', lib.fmt(p));
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
    } catch (e) {
      await lib.goTo(p.x, p.y, p.z, 0);
    }
  }

  // Wait for dimension change
  const startDim = bot.game.dimension;
  console.log('Waiting for Nether transit from:', startDim);
  bot.chat('delta: Inside Nether portal frame! Transiting now with 42 cobblestone...');

  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (bot.game.dimension !== startDim) {
      console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
      break;
    }
  }
}

console.log('Pos after portal transit:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 2. Check if we arrived in the Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Marching along East Ridge to mountain breach (44, 65, -149).`);
await lib.equipWeapon();

// 3. Tight East Ridge waypoints hugging the mountain wall (x=62..63)
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -141),
  new Vec3(44, 65, -149)
];

for (const wp of ridgeWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}! Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}:`, err.message);
  }

  // Defend against any aggressive hostile mob (skip neutral zombified piglins)
  const hostiles = lib.hostiles(10);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Defending against ${h.name} at dist ${h.dist}...`);
      try {
        await lib.fight(5, 5);
      } catch (e) {}
    }
  }

  // Check nearby teammates
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity && name !== 'delta') {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      if (d < 25) {
        console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist ${d}m)`);
      }
    }
  }
}

console.log('Final position in Nether:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

if (bot.entity.position.z <= -135) {
  bot.chat(`delta: Reached enclosed mountain tunnel at ${lib.fmt(bot.entity.position)}! United with team with 42 cobblestone.`);
}
