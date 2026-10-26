// programs/208-sleep-and-advance-to-nether.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Wait for canSleep (tick >= 12542) and sleep in bed
console.log('Waiting for sleep time (tick >= 12542)...');
for (let i = 0; i < 30; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      bot.chat('delta: Slept in bed with team, night skipped to dawn!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
    break;
  }
  await sleep(1000);
}

// Ensure sleep completes and morning arrives
await sleep(2000);
console.log('Time after sleep:', JSON.stringify(lib.time()));

// 2. Step outside base door to Nether portal (298, 73, -54)
const doorPos = new Vec3(294, 73, -54);
console.log('Going outside through door to Nether portal...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  console.log('Door notice:', e.message);
  await lib.goTo(296, 73, -54, 1);
}

// 3. Step into Nether portal block
console.log('Stepping into Nether portal at (298, 73, -54)...');
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

// 4. Wait for dimension change
const startDim = bot.game.dimension;
console.log('Inside portal frame, transiting to Nether...');
bot.chat('delta: Transiting Nether portal with stone sword, pickaxe, and 36 cobblestone...');

for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 5. Check if in Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Advancing along East Ridge trail to mountain breach (44, 65, -149).`);
await lib.equipWeapon();

// 6. Tight East Ridge waypoints hugging the mountain wall (x=62..63)
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
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {}

  // Defend with sword against any nearby aggressive hostiles
  const hostiles = lib.hostiles(8);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      try {
        await lib.fight(4, 4);
      } catch (e) {}
    }
  }
}

console.log('Reached mountain entrance pos:', lib.fmt(bot.entity.position));

// 7. Advance 1x2 tunnel into solid mountain rock from z=-150 North towards z=-156
if (bot.entity.position.z <= -140) {
  bot.chat('delta: Inside mountain breach! Digging 1x2 covered tunnel North towards Blaze Spawner (32, 68, -190)...');

  for (let z = -150; z >= -156; z--) {
    if (isCancelled()) break;

    // Ensure solid floor at y=64
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

    // Step forward into dug space
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
