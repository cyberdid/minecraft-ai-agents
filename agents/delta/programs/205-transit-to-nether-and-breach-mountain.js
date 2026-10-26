// programs/205-transit-to-nether-and-breach-mountain.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Step into Nether portal at (298, 73, -54)
if (bot.game.dimension !== 'minecraft:the_nether' && !bot.game.dimension.includes('nether')) {
  console.log('Walking 3 blocks into Nether portal at (298, 73, -54)...');
  const portalBlock = bot.findBlocks({
    matching: b => b.name === 'nether_portal',
    maxDistance: 8,
    count: 3
  })[0] || new Vec3(298, 73, -54);

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.x, portalBlock.y, portalBlock.z));
  } catch (e) {
    await lib.goTo(portalBlock.x, portalBlock.y, portalBlock.z, 0);
  }

  // Wait for dimension change
  const startDim = bot.game.dimension;
  console.log('Inside portal frame, waiting for transit from:', startDim);
  bot.chat('delta: Inside Nether portal frame! Transiting now with stone tools and 30 cobblestone...');

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

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Marching along East Ridge to mountain tunnel breach (44, 65, -149).`);
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
  new Vec3(44, 65, -146),
  new Vec3(44, 65, -149)
];

for (const wp of ridgeWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}! Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}:`, err.message);
  }

  // Defend against any aggressive hostile mobs
  const hostiles = lib.hostiles(8);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Defending against ${h.name} at dist ${h.dist}...`);
      try {
        await lib.fight(4, 4);
      } catch (e) {}
    }
  }
}

console.log('Reached mountain entrance pos:', lib.fmt(bot.entity.position));

// 4. Dig 1x2 tunnel into solid mountain rock from z=-149 North towards z=-156
if (bot.entity.position.z <= -140) {
  bot.chat('delta: Inside mountain breach! Digging 1x2 covered tunnel North towards Blaze Spawner (32, 68, -190)...');

  for (let z = -150; z >= -156; z--) {
    if (isCancelled()) break;
    console.log(`Digging tunnel step at x=44, z=${z}...`);

    // Ensure floor at y=64
    const floor = bot.blockAt(new Vec3(44, 64, z));
    if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
      try {
        await lib.place('cobblestone', 44, 64, z);
      } catch (e) {}
    }

    // Dig head block at y=66
    const head = bot.blockAt(new Vec3(44, 66, z));
    if (head && head.name !== 'air' && head.name !== 'cave_air') {
      try {
        await lib.dig(44, 66, z);
      } catch (e) {}
    }

    // Dig feet block at y=65
    const feet = bot.blockAt(new Vec3(44, 65, z));
    if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
      try {
        await lib.dig(44, 65, z);
      } catch (e) {}
    }

    // Move forward into dug step
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(44, 65, z));
    } catch (e) {
      await bot.lookAt(new Vec3(44.5, 65.0, z), true);
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    }
  }
}

const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
console.log(`Final pos in Nether: ${lib.fmt(bot.entity.position)}, Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
bot.chat(`delta: Mountain tunnel advanced to ${lib.fmt(bot.entity.position)}! Distance to Blaze Spawner: ${dist.toFixed(1)}m. Netherracks mined: ${lib.count('netherrack')}.`);
