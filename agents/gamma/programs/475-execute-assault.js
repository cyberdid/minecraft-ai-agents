// programs/475-execute-assault.js
console.log('=== GAMMA: HIGHWAY TO FORTRESS & BLAZE HARVEST ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Equip sword and shield
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 2. Configure pathfinder for safe Nether movement
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = false;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

// 3. Define 26 safe, fine-grained waypoints
const WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 50, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 58, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },   // East Ridge entrance
  { x: 63, y: 65, z: -15 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 65, z: -28 },
  { x: 63, y: 66, z: -35 },
  { x: 62.5, y: 66, z: -42 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61.5, y: 66, z: -90 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Fortress Workshop Bunker (100% Covered!)
  { x: 44, y: 65, z: -145 }, // Covered tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast wall
  { x: 38, y: 65, z: -176 }, // Cross bridge
  { x: 36.0, y: 66, z: -187.5 } // Firing slit!
];

// Find closest starting waypoint ahead
let startIdx = 0;
let minDist = Infinity;
for (let i = 0; i < WAYPOINTS.length; i++) {
  const d = bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z));
  if (d < minDist) {
    minDist = d;
    startIdx = i;
  }
}
if (minDist < 3.0 && startIdx < WAYPOINTS.length - 1) {
  startIdx++;
}

bot.chat(`gamma: Marching from WP ${startIdx + 1}/${WAYPOINTS.length} along East Ridge to Blaze Spawner Pillbox!`);
console.log(`Starting march from waypoint index ${startIdx} (${WAYPOINTS[startIdx].x}, ${WAYPOINTS[startIdx].y}, ${WAYPOINTS[startIdx].z})...`);

// 4. March loop with active shield defense
for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') {
    console.log('CRITICAL: Not in the_nether. Halting march.');
    break;
  }

  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.8) continue;

  console.log(`[WP ${i + 1}/${WAYPOINTS.length}] -> (${wp.x}, ${wp.y}, ${wp.z}) dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m, HP: ${bot.health.toFixed(1)}`);

  // Past z=-165: sneak + shield facing forward
  if (wp.z <= -165) {
    bot.setControlState('sneak', true);
    bot.activateItem(true);
  } else {
    bot.setControlState('sneak', false);
    bot.deactivateItem();
  }

  // Reactive projectile defense against ghasts / skeletons
  const hostile = Object.values(bot.entities).find(e =>
    e.name && (e.name.includes('fireball') || e.name === 'ghast' || e.name === 'skeleton') &&
    bot.entity.position.distanceTo(e.position) <= 20
  );
  if (hostile) {
    console.log(`Threat detected: ${hostile.name} at dist ${bot.entity.position.distanceTo(hostile.position).toFixed(1)}m. Raising shield!`);
    await bot.lookAt(hostile.position, true);
    bot.activateItem(true);
    await sleep(1000);
    bot.deactivateItem();
  }

  // Look down at path to avoid looking at Endermen
  await bot.lookAt(new Vec3(wp.x, wp.y - 0.5, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNearXZ(wp.x, wp.z, 2.0));
    } catch (e2) {}
  }

  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`Low HP (${bot.health}) at WP ${i + 1}, waiting behind cover with shield...`);
    bot.activateItem(true);
    await sleep(3000);
    bot.deactivateItem();
  }
}

bot.setControlState('sneak', false);
bot.deactivateItem();
console.log('March complete! Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 5. Pillbox Blaze Farming Loop
const slitPos = new Vec3(36.0, 66.0, -187.5);
if (bot.entity.position.distanceTo(slitPos) <= 7.0 && bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Locked into Spawner Pillbox firing slit (36.0, 66.0, -187.5)! Slaying Blazes alongside Alpha & Beta!');
  console.log('Settling into Pillbox firing stance...');

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -187.5, 0.4));
  } catch (e) {}

  const sword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword) {
    try { await bot.equip(sword, 'hand'); } catch (e) {}
  }

  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  // Keep shield raised by default
  bot.activateItem(true);

  while (!isCancelled() && Date.now() - farmStart < 120000 && bot.game.dimension === 'the_nether') {
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health.toFixed(1)}), taking cover behind wall at z=-184...`);
      bot.activateItem(true);
      try { await bot.pathfinder.goto(new goals.GoalNear(37, 66, -184, 0.8)); } catch (e) {}
      await sleep(3000);
      try { await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -187.5, 0.4)); } catch (e) {}
      continue;
    }

    // Keep position firmly locked inside the pillbox
    if (bot.entity.position.x < 35.5) {
      bot.setControlState('back', true);
      await sleep(150);
      bot.setControlState('back', false);
    }
    if (bot.entity.position.distanceTo(slitPos) > 1.2) {
      try { await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -187.5, 0.4)); } catch (e) {}
    }

    // 1. Check for hostile flankers
    const flankers = Object.values(bot.entities).filter(e =>
      e.isValid && (e.health === undefined || e.health > 0) &&
      ['wither_skeleton', 'piglin', 'zombified_piglin', 'magma_cube'].includes(e.name) &&
      bot.entity.position.distanceTo(e.position) <= 4.0
    );

    // 2. Check for Blazes
    const blazes = Object.values(bot.entities).filter(e =>
      e.isValid && e.name === 'blaze' && (e.health === undefined || e.health > 0)
    ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = flankers[0] || blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face target to block fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      // Strike if in melee range (<= 4.5m) and cooldown elapsed
      if (dist <= 4.5 && Date.now() - lastAttack > 625) {
        bot.deactivateItem(); // Lower shield
        if (sword) {
          try { await bot.equip(sword, 'hand'); } catch (e) {}
        }
        bot.attack(target);
        lastAttack = Date.now();
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Target eliminated! Total kills: ${killed}`);
        }
        await sleep(60);
        bot.activateItem(true); // Re-raise shield immediately!
      } else {
        bot.activateItem(true);
      }
    } else {
      // Face spawner at (32, 68, -190) with shield raised
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Vacuum safe items inside pillbox
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.3) {
      try { await lib.pickup(3.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`gamma: Harvested Blaze Rod! Total held: ${curRods}/${targetRods}`);
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
  try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.5); } catch (e) {}
  console.log(`Combat phase finished. Kills: ${killed}, Rods held: ${lib.count('blaze_rod')}`);
}

const finalRods = lib.count('blaze_rod');
bot.chat(`gamma: Round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
