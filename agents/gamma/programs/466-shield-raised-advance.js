// programs/466-shield-raised-advance.js
console.log('=== SHIELD-RAISED ADVANCE TO PILLBOX (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Enter Nether portal if in Overworld
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Shield in offhand! Entering Nether portal to march with raised shield!');

  // Navigate to portal sill at (299.5, 72.0, -52.5)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 0.8));
  } catch (e) {
    await bot.lookAt(new Vec3(299.5, 72.0, -52.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
    await sleep(2000);
    bot.clearControlStates();
  }

  // Step into active portal block (299.5, 73.0, -53.5)
  const target = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000 && !isCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in the_nether. Halting.');
  return { dim: bot.game.dimension, pos: bot.entity.position };
}

console.log('WARP SUCCESS! Position in Nether:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 2. Ensure shield in offhand and sword in hand
const shieldItem = bot.inventory.items().find(i => i.name === 'shield');
if (shieldItem && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shieldItem, 'off-hand'); } catch (e) {}
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  try { await bot.equip(sword, 'hand'); } catch (e) {}
}
console.log('Gear: Hand =', bot.heldItem?.name, ', Offhand =', bot.inventory.slots[45]?.name);

// 3. Configure strict fire and drop avoidance
const netherMoves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) netherMoves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) netherMoves.blocksToAvoid.add(mcData.blocksByName.lava.id);
netherMoves.canDig = false;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

// Initial descent from portal deck to bunker at (46, 65, -7)
try {
  await lib.goTo(46, 65, -7, 2.0, { dig: false, timeoutMs: 12000 });
} catch (e) {}

// Safe waypoints with fine-grained 5m intervals across the exposed Ghast ridge (z=-50 to -80)
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
  { x: 44, y: 65, z: -127 }, // Fortress Workshop Bunker (100% Covered!)
  { x: 44, y: 65, z: -145 }, // Covered tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast wall
  { x: 38, y: 65, z: -176 }, // Cross bridge
  { x: 35.8, y: 66, z: -188 } // Firing slit!
];

bot.chat('gamma: Marching with raised Shield through East Ridge to Spawner Pillbox (35.8, 66, -188)...');

// 4. March through waypoints with active shield protection
for (let i = 0; i < WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') {
    console.log('CRITICAL: Dimension changed. Stopping Nether march!');
    break;
  }

  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  console.log(`[March WP ${i + 1}/${WAYPOINTS.length}] -> (${wp.x}, ${wp.y}, ${wp.z}) [dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m, HP: ${bot.health.toFixed(1)}]`);

  // On exposed ridge (z between -45 and -115), keep gaze down and shield raised!
  if (wp.z <= -45 && wp.z >= -120) {
    bot.activateItem(true); // Raise shield against Ghast fireballs!
  } else if (wp.z < -120) {
    bot.deactivateItem(); // Safely inside covered tunnel past z=-120
  }

  // Look slightly down to avoid looking at Endermen
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, holding in cover.`);
    bot.activateItem(true);
    await sleep(4000);
  }
}

bot.deactivateItem();
console.log('End of march reached! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 5. Pillbox combat loop at Firing Slit (35.8, 66.0, -188.0)
const distToSlit = bot.entity.position.distanceTo(new Vec3(35.8, 66.0, -188.0));
if (distToSlit < 7.0 && bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Inside Spawner Pillbox with Shield! Slaying Blazes alongside Beta & Delta for Milestone 8!');

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.4));
  } catch (e) {}

  const swordItem = bot.inventory.items().find(i => i.name.includes('sword'));
  if (swordItem) await bot.equip(swordItem, 'hand');

  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  // Active shield raised by default
  bot.activateItem(true);

  while (!isCancelled() && Date.now() - farmStart < 120000 && bot.game.dimension === 'the_nether') {
    // If critical HP, retreat into covered hallway
    if (bot.health <= 5) {
      console.log(`HP low (${bot.health.toFixed(1)}), retreating to covered tunnel (44, 65, -169)...`);
      bot.activateItem(true);
      try { await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1.0)); } catch (e) {}
      await sleep(3000);
      break;
    }

    // Keep position strictly behind the slit (never wander west of x=35.4)
    if (bot.entity.position.x < 35.4) {
      bot.setControlState('back', true);
      await sleep(150);
      bot.setControlState('back', false);
    }
    if (bot.entity.position.distanceTo(new Vec3(35.8, 66.0, -188.0)) > 1.2) {
      try { await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.4)); } catch (e) {}
    }

    // 1. Attack any flanking hostile nearby (Piglin, Wither Skeleton)
    const flankers = Object.values(bot.entities).filter(e =>
      e.isValid && (e.health === undefined || e.health > 0) &&
      ['piglin', 'wither_skeleton', 'zombified_piglin', 'magma_cube'].includes(e.name) &&
      bot.entity.position.distanceTo(e.position) <= 4.2
    );

    // 2. Nearest Blazes
    const blazes = Object.values(bot.entities).filter(e =>
      e.isValid && e.name === 'blaze' && (e.health === undefined || e.health > 0)
    ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = flankers[0] || blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        bot.deactivateItem(); // Lower shield for 1 swing
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Target eliminated! Total kills: ${killed}`);
        }
        await sleep(60);
        bot.activateItem(true); // Immediately raise shield again!
      }
    }

    // Vacuum dropped Blaze Rods safely behind wall
    if (bot.entity.position.x >= 35.4 && Math.random() < 0.3) {
      try { await lib.pickup(3.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`gamma: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
      console.log(`*** BLAZE ROD ACQUIRED! Count = ${curRods} ***`);
    }

    if (curRods >= targetRods) {
      bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(120);
  }

  bot.deactivateItem();
  try { if (bot.entity.position.x >= 35.4) await lib.pickup(3.5); } catch (e) {}
  console.log(`Pillbox combat complete. Kills: ${killed}, Rods held: ${lib.count('blaze_rod')}`);
}

const finalRods = lib.count('blaze_rod');
bot.chat(`gamma: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
