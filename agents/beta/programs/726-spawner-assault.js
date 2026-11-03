// programs/726-spawner-assault.js
// Self-contained, robust Spawner Assault with Active Shield Blocking for Milestone 8
console.log('=== Program 726: Spawner Assault (Milestone 8) ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Inventory:', lib.inv());

bot.clearControlStates();
bot.pathfinder.stop();

// Equip shield in offhand (slot 45)
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
  throw new Error(`Failed to enter the_nether (current dimension: ${bot.game.dimension})`);
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

// 3. March Safe Waypoints to Pillbox
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
  { x: 36.5, y: 66, z: -187 } // Pillbox
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

bot.chat(`Beta: In Nether with Active Shield! Marching to Pillbox (36.5, 66, -187). Rods held: ${lib.count('blaze_rod')}/8`);
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

  // Pitch gaze down to ground level to avoid Enderman aggro
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
    console.log(`Health low (${bot.health}) during march at WP ${i + 1}, holding in cover.`);
    break;
  }
}

bot.setControlState('sneak', false);
console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Pillbox Combat with Active Shield Blocking
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0));
if (distToPillbox < 6.0 && bot.game.dimension === 'the_nether') {
  bot.chat('Beta: Locked inside Spawner Pillbox! Slaying Blazes shoulder-to-shoulder with team!');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
  } catch (e) {}

  if (sword) await bot.equip(sword, 'hand');

  const farmDurationMs = 120000;
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let killed = 0;

  // Active shield raised by default
  bot.activateItem(true);

  while (!isCancelled() && Date.now() - startTime < farmDurationMs && bot.game.dimension === 'the_nether') {
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health}), maintaining shield defense...`);
      bot.activateItem(true);
      await sleep(1000);
      continue;
    }

    // Keep position strictly locked inside pillbox
    if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0)) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.4));
      } catch (e) {}
    }

    // Find nearest blaze
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face target to block incoming fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      // Strike if in melee reach (<= 4.5m)
      if (dist <= 4.5 && Date.now() - lastAttack > 650) {
        bot.deactivateItem(); // Lower shield
        try { await bot.equip(sword, 'hand'); } catch (e) {}
        bot.attack(target);   // Strike!
        lastAttack = Date.now();
        hits++;
        bot.activateItem(true); // Raise shield immediately!
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze slain! Kills: ${killed}`);
        }
      } else {
        bot.activateItem(true); // Keep shield raised
      }
    } else {
      // Face spawner (32, 68, -190) with shield raised
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Safe vacuum inside pillbox
    const safeItems = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 2.5 &&
      e.position.x >= 35.5 &&
      e.position.z <= -185.0
    );
    for (const item of safeItems) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/8`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      console.log('Milestone 8 target reached: 8+ Blaze Rods!');
      bot.chat(`Beta: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(100);
  }

  bot.deactivateItem();
  const finalRods = lib.count('blaze_rod');
  console.log(`Combat cycle end. Total hits: ${hits}, Kills: ${killed}, Rods: ${finalRods}/8, HP: ${bot.health}`);
  bot.chat(`Beta: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

  // If 8+ rods secured, retreat to Overworld base!
  if (finalRods >= 8) {
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
