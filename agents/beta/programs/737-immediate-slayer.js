// programs/737-immediate-slayer.js
// Immediate Pillbox Combat from current position (36.6, 66.0, -187.5)
const TARGET_RODS = 8;
console.log('=== Program 737: Immediate Pillbox Slayer ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Inventory:', lib.inv());

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure shield in offhand and sword in mainhand
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// If in Overworld (e.g. if respawned), enter portal and march
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld, entering portal...');
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
  try { await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8)); } catch (e) {}
  const portalBlock = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(portalBlock) > 0.8) {
    await bot.lookAt(portalBlock.offset(0, 0.5, 0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(300);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error('Not in the_nether');
}

// 19 safe waypoints
const WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 },
  { x: 38, y: 65, z: -176 },
  { x: 36.0, y: 66, z: -188 }
];

// If far from pillbox, march waypoints
const distToSlit = bot.entity.position.distanceTo(new Vec3(36.0, 66.0, -188.0));
if (distToSlit > 7.0) {
  let startIdx = 0;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
      startIdx = i + 1;
    }
  }
  console.log(`Marching from WP ${startIdx} to Pillbox...`);
  for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
    const wp = WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;
    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    } else {
      bot.setControlState('sneak', false);
      bot.deactivateItem();
    }
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)); } catch (e) {}
  }
  bot.setControlState('sneak', false);
}

// Settle into firing position (35.8, 66.0, -188.0)
console.log('Positioning at firing slit (35.8, 66.0, -188.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.4));
} catch (e) {}

bot.chat(`Beta: In position at firing slit (35.8, 66, -188)! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/${TARGET_RODS}`);

const farmDurationMs = 120000;
const startTime = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let kills = 0;

// Raise shield by default
bot.activateItem(true);

while (!isCancelled() && Date.now() - startTime < farmDurationMs && bot.game.dimension === 'the_nether') {
  // If critical HP, retreat into covered hallway
  if (bot.health <= 5) {
    console.log(`HP critical (${bot.health.toFixed(1)}), retreating to covered tunnel (44, 65, -169)!`);
    bot.activateItem(true);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1.0));
    } catch (e) {}
    await sleep(2000);
    break;
  }

  // Ensure shield is raised
  bot.activateItem(true);

  // Position control: keep strictly between x=35.5 and x=36.2, z=-187.5..-188.5
  if (bot.entity.position.x < 35.5) {
    bot.setControlState('back', true);
    await sleep(150);
    bot.setControlState('back', false);
  }
  if (bot.entity.position.distanceTo(new Vec3(35.8, 66.0, -188.0)) > 1.2) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.4));
    } catch (e) {}
  }

  // 1. Immediate priority: Flanking melee threats (Piglins, Wither Skeletons)
  const flankers = Object.values(bot.entities).filter(e =>
    e.isValid && (e.health === undefined || e.health > 0) &&
    ['piglin', 'wither_skeleton', 'zombified_piglin', 'magma_cube'].includes(e.name) &&
    bot.entity.position.distanceTo(e.position) <= 4.5
  );

  // 2. Nearest Blazes
  const blazes = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'blaze' && (e.health === undefined || e.health > 0)
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const nearestBlaze = blazes[0];
  const target = flankers[0] || (nearestBlaze && bot.entity.position.distanceTo(nearestBlaze.position) <= 4.8 ? nearestBlaze : null);

  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.6, 0), true);

    if (Date.now() - lastAttack > 625) {
      bot.deactivateItem(); // Lower shield
      try { await bot.equip(sword, 'hand'); } catch (e) {}
      bot.attack(target);   // Strike!
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Eliminated ${target.name}! Kills: ${kills}`);
      }
    }
  } else if (nearestBlaze) {
    // Face nearest Blaze to block fireballs with shield
    await bot.lookAt(nearestBlaze.position.offset(0, (nearestBlaze.height || 1.8) * 0.7, 0), true);
    bot.activateItem(true);
  } else {
    // Face spawner at (32, 68, -190)
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum safe drops (x >= 34.0, z <= -185.0, dist <= 4.0m)
  const droppedItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 4.0 &&
    e.position.x >= 34.0 &&
    e.position.z <= -185.0
  );
  for (const it of droppedItems) {
    try {
      if (it.position.x >= 35.0) {
        await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.4));
      }
    } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${TARGET_RODS}`);
    console.log(`Harvested Blaze Rod! Total: ${curRods}/${TARGET_RODS}`);
    lastRods = curRods;
  }

  if (curRods >= TARGET_RODS) {
    bot.chat(`Beta: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const finalRods = lib.count('blaze_rod');
console.log(`Combat cycle end. Hits: ${hits}, Kills: ${kills}, Rods: ${finalRods}/${TARGET_RODS}, HP: ${bot.health}`);
bot.chat(`Beta: Combat session complete. Blaze Rods held: ${finalRods}/${TARGET_RODS}, HP: ${bot.health.toFixed(1)}`);

// If 8+ rods secured, retreat to Overworld base!
if (finalRods >= TARGET_RODS) {
  bot.chat(`Beta: 8+ Blaze Rods secured! Retreating to Overworld base!`);
  const rev = [...WAYPOINTS].reverse();
  for (const wp of rev) {
    if (isCancelled()) break;
    const v = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(v) < 2.5) continue;
    try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 }); } catch (e) {}
  }
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
  if (portal) {
    await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  }
  if (bot.game.dimension === 'overworld') {
    try { await lib.goTo(293, 72, -55, 2, { timeoutMs: 12000 }); } catch (e) {}
    try {
      const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
      if (chestBlock) {
        const chest = await bot.openChest(chestBlock);
        const rodItem = bot.inventory.items().find(i => i.name === 'blaze_rod');
        if (rodItem) await chest.deposit(rodItem.type, null, rodItem.count);
        await chest.close();
        bot.chat(`Beta: Deposited ${finalRods} Blaze Rods into base chest! Milestone 8 100% COMPLETE!`);
      }
    } catch (e) {}
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  hits,
  kills,
  hp: bot.health
};
