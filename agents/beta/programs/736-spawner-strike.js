// programs/736-spawner-strike.js
// Stage 2: Precision Spawner Strike to Complete Milestone 8 (8+ Blaze Rods)
console.log('=== Program 736: Spawner Strike for Milestone 8 ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Inventory:', lib.inv());

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure shield in offhand (slot 45) and stone_sword in hand
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// 1. Enter Nether Portal if in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 8000 }); } catch (e2) {}
  }

  const portalBlock = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(portalBlock) > 0.8) {
    await bot.lookAt(portalBlock.offset(0, 0.5, 0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
      await bot.lookAt(portalBlock, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(300);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether (current: ${bot.game.dimension})`);
}

console.log('In Nether! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step out of Nether portal bunker into base camp
if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
}

// 2. Active Fire Extinguisher Routine
async function clearFireAhead() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
}

// 3. March Safe Waypoints to Pillbox Firing Slit
const netherMoves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) netherMoves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) netherMoves.blocksToAvoid.add(mcData.blocksByName.lava.id);
netherMoves.canDig = false;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

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
  { x: 44, y: 65, z: -127 }, // Bunker
  { x: 44, y: 65, z: -145 }, // Covered tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast wall
  { x: 38, y: 65, z: -176 }, // Cross bridge
  { x: 36.0, y: 66, z: -188 } // Firing slit!
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

bot.chat(`Beta: In Nether with Active Shield! Marching to Firing Slit (36.0, 66, -188). Rods: ${lib.count('blaze_rod')}/8`);
console.log(`Marching from WP ${startIdx}/${WAYPOINTS.length} to Pillbox...`);

for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await clearFireAhead();

  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  // Past z=-165: sneak + raise shield facing ahead
  if (wp.z <= -165) {
    bot.setControlState('sneak', true);
    bot.activateItem(true);
  } else {
    bot.setControlState('sneak', false);
    bot.deactivateItem();
  }

  // Pitch gaze down to avoid Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) during march at WP ${i + 1}, taking cover.`);
    break;
  }
}

bot.setControlState('sneak', false);
console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Combat at the Firing Slit (36.0, 66.0, -188.0)
const distToSlit = bot.entity.position.distanceTo(new Vec3(36.0, 66.0, -188.0));
if (distToSlit < 7.0 && bot.game.dimension === 'the_nether') {
  bot.chat('Beta: Locked at Pillbox Firing Slit (36.0, 66, -188)! Slaying Blazes for Milestone 8!');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -188.0, 0.4));
  } catch (e) {}

  if (sword) await bot.equip(sword, 'hand');

  // Place floor block at (34, 66, -188) if missing to eliminate gap!
  const gapBlock = bot.blockAt(new Vec3(34, 66, -188));
  if (gapBlock && (gapBlock.name === 'air' || gapBlock.name === 'cave_air') && lib.count('cobblestone') > 0) {
    console.log('Bridging gap block at (34, 66, -188)...');
    try {
      const refBlock = bot.blockAt(new Vec3(35, 66, -188));
      if (refBlock && refBlock.boundingBox === 'block') {
        const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
        if (cobble) {
          await bot.equip(cobble, 'hand');
          await bot.placeBlock(refBlock, new Vec3(-1, 0, 0));
          console.log('Placed cobblestone floor at (34, 66, -188)!');
        }
      }
    } catch (e) {
      console.log('Floor bridging note:', e.message);
    }
    if (sword) await bot.equip(sword, 'hand');
  }

  const farmDurationMs = 120000;
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let kills = 0;

  // Active shield raised by default
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

    // Keep position strictly at firing slit (never wander west of x=35.5)
    if (bot.entity.position.x < 35.5) {
      bot.setControlState('back', true);
      await sleep(150);
      bot.setControlState('back', false);
    }
    if (bot.entity.position.distanceTo(new Vec3(36.0, 66.0, -188.0)) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -188.0, 0.4));
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
      // Face target directly
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.6, 0), true);

      // Strike if cooldown ready (> 625ms)
      if (Date.now() - lastAttack > 625) {
        bot.deactivateItem(); // Lower shield
        try { await bot.equip(sword, 'hand'); } catch (e) {}
        bot.attack(target);   // Strike!
        lastAttack = Date.now();
        hits++;
        bot.activateItem(true); // Raise shield immediately!

        if (target.health !== undefined && target.health <= 0) {
          kills++;
          console.log(`Eliminated ${target.name}! Kills: ${kills}`);
        }
      } else {
        bot.activateItem(true); // Keep shield raised
      }
    } else if (nearestBlaze) {
      // Face nearest Blaze to block incoming fireballs with shield
      await bot.lookAt(nearestBlaze.position.offset(0, (nearestBlaze.height || 1.8) * 0.7, 0), true);
      bot.activateItem(true);
    } else {
      // Face spawner at (32, 68, -190)
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Vacuum safe drops inside/near slit (x >= 35.0, distance <= 3.5m)
    const droppedItems = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 3.5 &&
      e.position.x >= 35.0
    );
    for (const it of droppedItems) {
      try {
        if (it.position.x >= 35.5) {
          await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.4));
        }
      } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }

    if (curRods >= targetRods) {
      bot.chat(`Beta: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(100);
  }

  bot.deactivateItem();
  const finalRods = lib.count('blaze_rod');
  console.log(`Combat cycle end. Hits: ${hits}, Kills: ${kills}, Rods: ${finalRods}/${targetRods}, HP: ${bot.health}`);
  bot.chat(`Beta: Combat round complete. Blaze Rods held: ${finalRods}/${targetRods}, HP: ${bot.health.toFixed(1)}`);

  // If 8+ rods secured, retreat to Overworld base!
  if (finalRods >= targetRods) {
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
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health
};
