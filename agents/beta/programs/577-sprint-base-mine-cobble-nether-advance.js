// programs/577-sprint-base-mine-cobble-nether-advance.js
console.log('=== Step: Sprint Base, Lock Spawn, Gather Tools & Cobble, Transit Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Sprint to Base Camp
const waypoints = [
  new Vec3(210, 64, -45),
  new Vec3(250, 68, -50),
  new Vec3(285, 72, -54),
  new Vec3(294, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.clearControlStates();
  }
}

console.log('Arrived outside Base door at:', lib.fmt(bot.entity.position));

// 2. Step through base door (294, 72, -54) and lock spawn
console.log('Stepping through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside Base at:', lib.fmt(bot.entity.position));
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn locked at Base!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 3. Step out door to mine shaft and gather resources
console.log('Stepping outside to gather wood and mine cobblestone...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Gather 2 logs if needed
if (lib.count('*_log') < 2 && lib.count('*_planks') < 8) {
  try {
    await lib.collect('*_log', 2);
  } catch (e) {
    console.log('Log collect note:', e.message);
  }
}

// Craft planks, sticks, wooden pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName && lib.count('*_planks') < 4) {
  await lib.craft(logName.replace('_log', '_planks'), lib.count(logName) * 4);
}
if (lib.count('stick') < 2) await lib.craft('stick', 4);
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}

// Go to mine shaft entrance at (301, 71, -44)
await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));

// Mine 3 stone for stone pickaxe & sword
console.log('Mining 3 stone for stone tools...');
for (let s = 0; s < 5; s++) {
  if (lib.count('cobblestone') >= 3) break;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(4);
    } catch (e) {}
  }
}

if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted!');
}

// Mine 24+ cobblestone
console.log('Mining 24+ cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 24 && digs < 30 && !isCancelled()) {
  digs++;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71 && (b.position.x >= 298 || b.position.z >= -48)
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(3);
    } catch (e) {
      break;
    }
  } else {
    break;
  }
}

console.log('Cobblestone mined:', lib.count('cobblestone'));
await lib.equipWeapon();

// 4. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting to Nether portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 5. Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

if (bot.game.dimension.includes('nether')) {
  if (typeof configureFireAvoidance === 'function') {
    configureFireAvoidance();
  }
}

bot.chat(`beta: Re-armed with stone tools & ${lib.count('cobblestone')} cobble! In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Sprinting to spawner front!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
