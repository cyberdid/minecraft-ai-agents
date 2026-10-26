// programs/215-craft-pick-mine-cobble-and-transit.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));

// Stop any previous pathfinder goals
bot.pathfinder.stop();
await sleep(500);

// 1. Craft stone_pickaxe if not present
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  console.log('Crafting stone_pickaxe...');
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (e) {
    console.log('Craft pickaxe notice:', e.message);
  }
}

// 2. Mine 25 cobblestone with stone pickaxe (or wooden pickaxe)
console.log('Mining 25 cobblestone...');
bot.chat('delta: Mining cobblestone before Nether transit...');
try {
  await lib.collect('stone', 25);
  console.log('Cobblestone collected! Count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Cobble mine notice:', e.message);
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));

// 3. Walk to Nether portal at (298, 73, -54)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(298, 73, -54, 1);
} catch (e) {
  console.log('goTo portal notice:', e.message);
}

// 4. Step into Nether portal block
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

// 5. Wait for dimension change
const startDim = bot.game.dimension;
console.log('Inside portal frame, transiting to Nether...');
bot.chat('delta: Inside Nether portal frame! Transiting now with stone tools and cobblestone...');

for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 6. Check if in Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Advancing along East Ridge trail to mountain breach (44, 65, -149).`);
await lib.equipWeapon();

// 7. Tight East Ridge waypoints hugging mountain wall
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

// 8. Dig 1x2 tunnel into solid mountain rock from z=-150 North towards z=-156
if (bot.entity.position.z <= -140) {
  bot.chat('delta: Inside mountain breach! Digging 1x2 covered tunnel North towards Blaze Spawner (32, 68, -190)...');

  for (let z = -150; z >= -156; z--) {
    if (isCancelled()) break;

    const floor = bot.blockAt(new Vec3(44, 64, z));
    if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
      try {
        await lib.place('cobblestone', 44, 64, z);
      } catch (e) {}
    }

    const head = bot.blockAt(new Vec3(44, 66, z));
    if (head && head.name !== 'air' && head.name !== 'cave_air') {
      try {
        await lib.dig(44, 66, z);
      } catch (e) {}
    }

    const feet = bot.blockAt(new Vec3(44, 65, z));
    if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
      try {
        await lib.dig(44, 65, z);
      } catch (e) {}
    }

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
