// programs/468-advance-to-pillbox-and-slay.js
console.log('=== ADVANCE TO PILLBOX & SLAY BLAZES (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in the_nether. Halting.');
  return { error: 'wrong dimension', dim: bot.game.dimension };
}

// 1. Ensure sword in main hand and shield in offhand
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  try { await bot.equip(sword, 'hand'); } catch (e) {}
}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}
console.log('Gear confirmed: Held =', bot.heldItem?.name, ', Offhand =', bot.inventory.slots[45]?.name);

// 2. Configure movements
const netherMoves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) netherMoves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) netherMoves.blocksToAvoid.add(mcData.blocksByName.lava.id);
netherMoves.canDig = false;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

const REMAINING_WAYPOINTS = [
  { x: 61.5, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -70 },
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

bot.chat('gamma: In Nether at z=-47! Advancing along paved ridge to join Beta & Delta at Pillbox (35.8, 66, -188)...');

// 3. March through waypoints
for (let i = 0; i < REMAINING_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') {
    console.log('CRITICAL: Dimension changed. Stopping Nether march!');
    break;
  }

  const wp = REMAINING_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.2) continue;

  console.log(`[March WP ${i + 1}/${REMAINING_WAYPOINTS.length}] -> (${wp.x}, ${wp.y}, ${wp.z}) [dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m, HP: ${bot.health.toFixed(1)}]`);

  // Look down at path to avoid looking at Endermen
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.5, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNearXZ(wp.x, wp.z, 2.5));
    } catch (e2) {
      console.log(`GoalNearXZ note at WP ${i + 1}: ${e2.message}`);
    }
  }

  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, pausing in cover.`);
    await sleep(4000);
  }
}

console.log('End of march reached! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Pillbox combat loop at Firing Slit (35.8, 66.0, -188.0)
const distToSlit = bot.entity.position.distanceTo(new Vec3(35.8, 66.0, -188.0));
if (distToSlit < 8.0 && bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Locked at Spawner Pillbox firing slit (35.8, 66, -188)! Slaying Blazes shoulder-to-shoulder with team for Milestone 8!');

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.5));
  } catch (e) {}

  if (sword) await bot.equip(sword, 'hand');

  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  while (!isCancelled() && Date.now() - farmStart < 140000 && bot.game.dimension === 'the_nether') {
    // If critical HP, retreat into covered hallway at (44, 65, -169)
    if (bot.health <= 5) {
      console.log(`HP low (${bot.health.toFixed(1)}), taking cover behind wall at z=-184...`);
      try { await bot.pathfinder.goto(new goals.GoalNear(37, 66, -184, 1.0)); } catch (e) {}
      await sleep(3000);
      try { await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.5)); } catch (e) {}
      continue;
    }

    // Keep position strictly behind the slit (never wander west of x=35.4)
    if (bot.entity.position.x < 35.4) {
      bot.setControlState('back', true);
      await sleep(150);
      bot.setControlState('back', false);
    }
    if (bot.entity.position.distanceTo(new Vec3(35.8, 66.0, -188.0)) > 1.2) {
      try { await bot.pathfinder.goto(new goals.GoalNear(35.8, 66.0, -188.0, 0.5)); } catch (e) {}
    }

    // 1. Immediate priority: Flanking hostiles nearby
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
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Target eliminated! Total kills: ${killed}`);
        }
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
