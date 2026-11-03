// programs/431-march-all-the-way.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

try { await lib.equipWeapon(); } catch (e) {}

// Configure movements with fire avoidance
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

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
  { x: 36, y: 66, z: -187 }  // 15 (Spawner Pillbox)
];

let startIdx = 3;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

bot.chat(`delta: Marching from WP ${startIdx} straight to Spawner Pillbox (36, 66, -187)!`);
console.log(`Marching from index ${startIdx}...`);

for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  console.log(`Marching to WP ${i} (${wp.x}, ${wp.y}, ${wp.z})...`);
  let timer = null;
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 12000); })
    ]);
  } catch (e) {
    console.log(`WP ${i} fallback walk (${e.message})...`);
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

  try { await lib.pickup(3.0); } catch (e) {}
}

console.log('March complete. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// At Spawner Pillbox
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36, 66, -187));
console.log(`Distance to Pillbox: ${distToPillbox.toFixed(1)}m`);

if (distToPillbox < 6.0) {
  bot.chat('delta: Inside Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods).');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  // Position behind slit at (37, 66, -186)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(37, 66, -186, 0.8));
  } catch (e) {}

  const farmDurationMs = 150000;
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  console.log(`Blaze combat active. Starting rods: ${lastRods}`);

  while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
    // Attack closest blaze within 5.0m
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 5.0 && Date.now() - lastAttack > 625) {
        try { await lib.equipWeapon(); } catch (e) {}
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        console.log(`Hit Blaze at dist ${dist.toFixed(1)}m (target HP: ${target.health})`);
        if (target.health !== undefined && target.health <= 0) killed++;
      }
    }

    // Safe pickup (stay >= 35.5)
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.3) {
      try { await lib.pickup(3.0); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      console.log('Milestone 8 target reached: 8+ Blaze Rods!');
      break;
    }

    await sleep(150);
  }

  try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.5); } catch (e) {}

  const totalRods = lib.count('blaze_rod');
  console.log(`Combat cycle end. Total rods: ${totalRods}/8, HP: ${bot.health}`);
  bot.chat(`delta: Farming cycle complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

  if (totalRods >= 8) {
    bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base to deposit.');
    console.log('Retreating to Overworld base...');
    const retRes = await retreatToOverworldBase();
    console.log('Retreat result:', JSON.stringify(retRes));

    if (bot.game.dimension === 'overworld') {
      try {
        await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
        bot.chat('delta: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
      } catch (e) {}
    }
  }
}
