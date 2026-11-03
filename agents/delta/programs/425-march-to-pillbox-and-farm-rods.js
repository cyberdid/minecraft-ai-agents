// programs/425-march-to-pillbox-and-farm-rods.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Equip weapon and armor
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
console.log('Held weapon:', bot.heldItem?.name);

// 2. Configure movements with fire avoidance
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// 3. March remaining waypoints from WP 3 to WP 15
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
  { x: 44, y: 65, z: -127 }, // 10 (Fortress Workshop Bunker)
  { x: 44, y: 65, z: -145 }, // 11 (Covered Tunnel)
  { x: 44, y: 65, z: -160 }, // 12
  { x: 44, y: 65, z: -169 }, // 13 (Blast Wall)
  { x: 38, y: 65, z: -176 }, // 14 (Cross Bridge)
  { x: 36, y: 66, z: -187 }  // 15 (Spawner Pillbox)
];

// Find closest waypoint ahead of us
let startIdx = 3;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 4.0) {
    startIdx = i + 1;
  }
}

bot.chat(`delta: Marching from WP ${startIdx} to Spawner Pillbox (36, 66, -187)...`);
console.log(`Starting march from index ${startIdx}...`);

for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;
  
  console.log(`Navigating to WP ${i} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    let timer;
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 12000); })
    ]);
    clearTimeout(timer);
    console.log(`Reached WP ${i}! Pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    clearTimeout(timer);
    console.log(`WP ${i} goto failed: ${e.message}, trying direct look/walk...`);
    try {
      await bot.lookAt(target.offset(0.5, 1, 0.5), true);
      bot.setControlState('forward', true);
      if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(1500);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
      console.log(`Direct walk WP ${i} ended at:`, lib.fmt(bot.entity.position));
    } catch (e2) {}
  }

  // Safe pickup along path (in case teammate dropped gear/rods)
  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`Health critical (${bot.health.toFixed(1)}) during march, holding position.`);
    break;
  }
}

console.log('March stage complete. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Farm Blazes at Spawner Pillbox
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36, 66, -187));
console.log(`Distance to Pillbox: ${distToPillbox.toFixed(1)}m`);

if (distToPillbox < 6.0) {
  bot.chat('delta: Inside Spawner Pillbox! Engaging Blazes for Milestone 8 (Blaze Rods).');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const farmDurationMs = 120000; // 2 minutes
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  console.log(`Starting Blaze combat cycle. Initial rods: ${lastRods}`);

  while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
    if (bot.health <= 7) {
      console.log(`HP low (${bot.health.toFixed(1)}), retreating to covered tunnel at (44, 65, -169)!`);
      bot.chat('delta: HP low, retreating to tunnel cover!');
      try {
        await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1.5));
      } catch (e) {}
      break;
    }

    if (bot.food < 16) {
      try { await lib.eat(); } catch (e) {}
    }

    // Find nearest Blaze
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        try { await lib.equipWeapon(); } catch (e) {}
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (target HP: ${target.health})`);
        if (target.health !== undefined && target.health <= 0) killed++;
      }
    }

    // Safe pickup: stay at x >= 35.5 (never fall into lava abyss at x <= 33)
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.3) {
      try { await lib.pickup(2.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      console.log('Target of 8 Blaze Rods reached!');
      break;
    }

    await sleep(200);
  }

  // Final pickup
  try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.0); } catch (e) {}

  const finalRods = lib.count('blaze_rod');
  console.log(`Blaze combat finished. Killed: ${killed}, Rods held: ${finalRods}, HP: ${bot.health}`);
  bot.chat(`delta: Blaze combat round complete. Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

  if (finalRods >= 8) {
    bot.chat('delta: Milestone 8 COMPLETE (8+ Blaze Rods)! Retreating to base.');
    console.log('Retreating to Overworld base...');
    const retRes = await retreatToOverworldBase();
    console.log('Retreat result:', JSON.stringify(retRes));
  }
} else {
  console.log(`March ended at ${lib.fmt(bot.entity.position)}, not yet at Pillbox.`);
}
