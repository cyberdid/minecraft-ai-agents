// programs/214-mine-stone-craft-tools-and-transit.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));

// 1. Mine 5 stone with wooden pickaxe in hand
console.log('Mining 5 stone for stone pickaxe & sword...');
bot.chat('delta: Mining stone with wooden pickaxe to craft stone tools & 30 cobble...');

try {
  await lib.collect('stone', 5);
} catch (e) {
  console.log('Stone mine notice:', e.message);
}

// 2. Craft stone_pickaxe and stone_sword
try {
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  }
} catch (e) {
  console.log('Stone tool craft error:', e.message);
}

// 3. Mine 30 cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  console.log('Mining 30 building cobblestone with stone pickaxe...');
  try {
    await lib.collect('stone', 30);
    console.log('Cobblestone collected! Total:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobble mine notice:', e.message);
  }
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
console.log('Gear before portal:', JSON.stringify(lib.tools()));

// 4. Walk to Nether portal at (298, 73, -54)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(298, 73, -54, 1);
} catch (e) {
  console.log('goTo portal notice:', e.message);
}

// 5. Step into Nether portal block
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

// 6. Wait for dimension change
const startDim = bot.game.dimension;
console.log('Inside portal, waiting for Nether transit...');
bot.chat('delta: Inside Nether portal frame! Transiting now with stone tools and cobblestone...');

for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 7. Check if in Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Marching along East Ridge to mountain breach (44, 65, -149).`);
await lib.equipWeapon();

// 8. Tight East Ridge waypoints hugging the mountain wall (x=62..63)
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

console.log('Reached mountain breach pos:', lib.fmt(bot.entity.position));

// 9. Advance 1x2 tunnel into solid mountain rock from z=-150 North towards z=-156
if (bot.entity.position.z <= -140) {
  bot.chat('delta: Inside mountain breach! Digging 1x2 covered tunnel North towards Blaze Spawner (32, 68, -190)...');

  for (let z = -150; z >= -156; z--) {
    if (isCancelled()) break;

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
