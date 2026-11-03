// programs/422-joint-pillbox-assault.js
console.log('=== JOINT PILLBOX BLAZE ASSAULT (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Cancel previous background loops
const myAssaultId = Date.now();
globalThis.activeAssaultId = myAssaultId;
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Enter Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Navigating to portal block (299.5, 73, -54)...');
  if (bot.entity.position.x < 297 && bot.entity.position.z < -53.5) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }
  await globalThis.enterNetherPortal();
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Failed to enter Nether, dim:', bot.game.dimension);
  return { error: 'Not in nether' };
}

bot.chat('gamma: In Nether! Fast marching with team to Spawner Pillbox (36, 66, -186)!');

// Configure fire avoidance
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
moves.maxDropDown = 2;
bot.pathfinder.setMovements(moves);

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Step out of Nether portal bunker if needed
if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

const WAYPOINTS = [
  { x: 46, y: 65, z: -7 },   // 0
  { x: 54, y: 65, z: -7 },   // 1
  { x: 63, y: 64, z: -7 },   // 2
  { x: 63, y: 65, z: -20 },  // 3
  { x: 63, y: 66, z: -35 },  // 4
  { x: 62, y: 67, z: -50 },  // 5
  { x: 61, y: 67, z: -65 },  // 6
  { x: 62, y: 67, z: -80 },  // 7
  { x: 61, y: 66, z: -100 }, // 8
  { x: 50, y: 65, z: -115 }, // 9
  { x: 44, y: 65, z: -127 }, // 10
  { x: 44, y: 65, z: -145 }, // 11
  { x: 44, y: 65, z: -160 }, // 12
  { x: 44, y: 65, z: -169 }, // 13
  { x: 38, y: 65, z: -176 }, // 14
  { x: 36, y: 66, z: -186 }  // 15 (Inside Spawner Pillbox)
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Marching from WP ${startIdx} to Pillbox...`);
for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  if (globalThis.activeAssaultId !== myAssaultId) return;
  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  // Mob defense along the path
  const piglin = bot.nearestEntity(e => (e.name === 'piglin' || e.name === 'piglin_brute') && e.position.distanceTo(bot.entity.position) <= 4.0);
  if (piglin) {
    console.log(`Defending against Piglin at dist=${bot.entity.position.distanceTo(piglin.position).toFixed(1)}m...`);
    await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
    bot.attack(piglin);
    await sleep(625);
    bot.attack(piglin);
    await sleep(625);
  }

  let timer = null;
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 10000); })
    ]);
  } catch (e) {
    try {
      await bot.lookAt(target.offset(0.5, 1, 0.5), true);
      bot.setControlState('forward', true);
      if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(1500);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    } catch (e2) {}
  } finally {
    if (timer) clearTimeout(timer);
  }

  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}) at WP ${i}, holding cover.`);
    break;
  }
}

console.log('March complete. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 2. Lock position inside Spawner Pillbox at (36.0, 66.0, -186.0)
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36, 66, -186));
if (distToPillbox <= 6.0) {
  bot.chat('gamma: Locked in Spawner Pillbox at (36, 66, -186)! Engaging Blazes alongside Beta and Delta!');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -186.0, 0.6));
  } catch (e) {}

  // 3. Combat loop
  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  while (!isCancelled() && Date.now() - farmStart < 160000) {
    if (globalThis.activeAssaultId !== myAssaultId) break;

    if (bot.health <= 5) {
      // Hold stationary in cover
      await sleep(1000);
      continue;
    }

    // Target Blazes within 4.8m reach
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze eliminated! Total kills: ${killed}`);
        }
      }
    }

    // Vacuum drops stationary
    if (Math.random() < 0.25) {
      try { await lib.pickup(3.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`gamma: Blaze Rod harvested! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }
    if (curRods >= targetRods) break;
    await sleep(150);
  }

  try { await lib.pickup(4.0); } catch (e) {}
}

const finalRods = lib.count('blaze_rod');
console.log(`Assault cycle complete. Blaze Rods: ${finalRods}, HP: ${bot.health}, Pos: ${lib.fmt(bot.entity.position)}`);

if (finalRods >= 8) {
  bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${finalRods} Blaze Rods!`);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
