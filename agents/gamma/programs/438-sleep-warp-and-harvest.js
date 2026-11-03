// programs/438-sleep-warp-and-harvest.js
console.log('=== SLEEP TO DAWN, WARP & CLEAN COMBAT HARVEST (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Cancel previous background loops
const myAssaultId = Date.now();
globalThis.activeAssaultId = myAssaultId;
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Sleep in bed until dawn
if (bot.game.dimension === 'overworld') {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
  console.log('Bed found nearby:', bed ? lib.fmt(bed.position) : 'none');

  const sleepDeadline = Date.now() + 100000;
  while (Date.now() < sleepDeadline && !isCancelled()) {
    const t = bot.time.timeOfDay;
    if (t < 1000 || t > 23500) {
      console.log('Dawn arrived! Time:', t);
      break;
    }
    const canSleep = t >= 12542 && t <= 23460;
    if (canSleep && bed) {
      try {
        console.log('Sleeping in bed...');
        await bot.sleep(bed);
        console.log('Sleeping!');
        await sleep(5000);
      } catch (e) {
        console.log('Sleep note:', e.message);
      }
    }
    await sleep(1000);
  }

  // Ensure sword in hand, shield in offhand
  try {
    const sword = bot.inventory.items().find(i => i.name.includes('sword'));
    if (sword) await bot.equip(sword, 'hand');
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
  } catch (e) {}

  // 2. Exit base door and enter Nether portal
  console.log('Exiting base door at (294, 72, -54)...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  console.log('Moving to Nether portal sill (299, 72, -53)...');
  try {
    await lib.goTo(299, 72, -53, 1.0, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.0, 1.0));
    } catch (e2) {}
  }

  console.log('Entering purple nether_portal block...');
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1500);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  bot.pathfinder.stop();
  bot.clearControlStates();

  console.log('Waiting for dimension warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-54.0)) > 0.4 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }

  if (bot.game.dimension === 'the_nether') {
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Transit failed, dim:', bot.game.dimension);
  return { error: 'Transit failed' };
}

bot.chat('gamma: In Nether with full 20 HP & Shield! Fast marching to Spawner Pillbox (37, 66, -186)!');

// Configure fire avoidance
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
moves.maxDropDown = 2;
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
  { x: 44, y: 65, z: -127 }, // 10 (Fortress Workshop Bunker)
  { x: 44, y: 65, z: -145 }, // 11
  { x: 44, y: 65, z: -160 }, // 12
  { x: 44, y: 65, z: -169 }, // 13 (Blast Wall)
  { x: 38, y: 65, z: -176 }, // 14
  { x: 37, y: 66, z: -186 }  // 15 (Inside Spawner Pillbox)
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

  // Active mob defense
  const piglin = bot.nearestEntity(e => (e.name === 'piglin' || e.name === 'piglin_brute') && e.position.distanceTo(bot.entity.position) <= 3.8);
  if (piglin) {
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

  if (bot.health <= 5) {
    console.log(`HP low (${bot.health}) at WP ${i}, holding cover.`);
    break;
  }
}

console.log('Arrived near Pillbox. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step into Pillbox firing position at (37.0, 66.0, -186.0)
const distToPillbox = bot.entity.position.distanceTo(new Vec3(37, 66, -186));
if (distToPillbox <= 6.0) {
  bot.chat('gamma: Inside Spawner Pillbox with Shield! Slaying Blazes shoulder-to-shoulder with team!');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(37.0, 66.0, -186.0, 0.5));
  } catch (e) {}

  // Ensure sword equipped in hand
  try {
    const sword = bot.inventory.items().find(i => i.name.includes('sword'));
    if (sword) await bot.equip(sword, 'hand');
  } catch (e) {}

  console.log('Ready for combat! Held:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);

  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  while (!isCancelled() && Date.now() - farmStart < 160000) {
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
      try { await lib.pickup(3.8); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`gamma: Blaze Rod harvested! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
      console.log(`*** BLAZE ROD ACQUIRED! Count = ${curRods} ***`);
    }

    if (curRods >= targetRods) {
      bot.chat(`gamma: MILESTONE 8 COMPLETE! Reached ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(120);
  }

  try { await lib.pickup(4.0); } catch (e) {}
}

const finalRods = lib.count('blaze_rod');
console.log(`Assault cycle complete. Blaze Rods: ${finalRods}, HP: ${bot.health}, Pos: ${lib.fmt(bot.entity.position)}`);

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
