// programs/585-nether-corridor-sprint-to-spawner.js
console.log('=== Step: Craft Weapon, Mine Netherrack, Apply Fire Avoidance & Sprint to Front ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

if (!bot.game.dimension.includes('nether')) {
  throw new Error('Not in Nether! Current dim: ' + bot.game.dimension);
}

// 1. Craft wooden sword
if (lib.count('wooden_sword') < 1 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('wooden_sword', 1);
    await lib.equipWeapon();
    console.log('Crafted & equipped wooden_sword!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// 2. Configure pathfinder fire avoidance
if (typeof configureFireAvoidance === 'function') {
  configureFireAvoidance();
} else {
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  bot.pathfinder.setMovements(moves);
}

// 3. Step East out of bunker and mine 24 netherrack
console.log('Exiting bunker East to (46, 65, -7)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
} catch (e) {
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

console.log('Mining 24 netherrack from wall...');
let mined = 0;
while (lib.count('netherrack') < 24 && mined < 30 && !isCancelled()) {
  mined++;
  const nr = bot.findBlock({ matching: mcData.blocksByName.netherrack.id, maxDistance: 4 });
  if (nr) {
    try {
      await lib.dig(nr.position.x, nr.position.y, nr.position.z);
      await lib.pickup(3);
    } catch (e) {
      break;
    }
  } else {
    break;
  }
}
console.log('Netherrack count:', lib.count('netherrack'));

// Helper to extinguish fire safely
async function clearNearbyFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 4, count: 6 });
  for (const fp of fires) {
    try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
  }
}

// 4. Safe East Ridge Waypoints to Spawner Frontline
const waypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -141),
  new Vec3(44, 65, -149),
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -170),
  new Vec3(44, 65, -176)
];

bot.chat('beta: Sprinting along safe East Ridge with fire avoidance to reinforce Spawner front at (44, 65, -176)!');

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

  await clearNearbyFire();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`WP ${i+1} path note:`, err.message);
    try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false }); } catch (e2) {}
  }

  // Pick up dropped gear along hallway
  if (wp.z <= -127) {
    await lib.pickup(8);
    await lib.equipArmor();
    await lib.equipWeapon();
  }
}

// 5. Arrived at bridgehead (44, 65, -176)
console.log('Arrived at bridgehead! Pos:', lib.fmt(bot.entity.position));
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();

const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
const totalBlocks = lib.count('cobblestone') + lib.count('netherrack') + lib.count('dirt');
const shield = lib.count('shield');
const blazeRods = lib.count('blaze_rod');
const invSummary = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');

console.log(`FRONT STATUS: Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health.toFixed(1)}, Shield=${shield}, Blocks=${totalBlocks}, BlazeRods=${blazeRods}, DistToSpawner=${distToSpawner.toFixed(1)}m`);
console.log(`Inventory: ${invSummary}`);

bot.chat(`beta: United at bridgehead (${lib.fmt(bot.entity.position)})! Shield: ${shield}, Blocks: ${totalBlocks}, Blaze Rods: ${blazeRods}. Dist to Spawner: ${distToSpawner.toFixed(1)}m!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  shield,
  totalBlocks,
  blazeRods,
  distToSpawner,
  inv: lib.inv()
};
