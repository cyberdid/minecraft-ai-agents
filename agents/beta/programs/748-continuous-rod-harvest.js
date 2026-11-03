// programs/748-continuous-rod-harvest.js
// Stage 2: Continuous Slaying & Vacuuming until 8+ Blaze Rods Secured!
const TARGET_RODS = 8;
console.log('=== Program 748: Continuous Blaze Rod Harvest (Milestone 8) ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Current Blaze Rods in inventory:', lib.count('blaze_rod'));

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

// Firing stance at (35.5, 66.0, -188.0)
const firingPos = new Vec3(35.5, 66.0, -188.0);
try {
  await bot.pathfinder.goto(new goals.GoalNear(firingPos.x, firingPos.y, firingPos.z, 0.5));
} catch (e) {}

bot.chat(`Beta: In frontline stance with Shield! Harvesting Blaze Rods for Milestone 8! Rods: ${lib.count('blaze_rod')}/${TARGET_RODS}`);

const farmDurationMs = 150000;
const startTime = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let lockedTargetId = null;

// Keep shield raised by default
bot.activateItem(true);

while (!isCancelled() && Date.now() - startTime < farmDurationMs && bot.game.dimension === 'the_nether') {
  // If HP critical, step into covered tunnel
  if (bot.health <= 5) {
    console.log(`HP critical (${bot.health.toFixed(1)}), retreating to covered tunnel (44, 65, -169)!`);
    bot.activateItem(true);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1.0));
    } catch (e) {}
    await sleep(2000);
    break;
  }

  // Ensure shield is actively raised
  bot.activateItem(true);

  // Position control: keep strictly near firing stance
  if (bot.entity.position.x < 34.8) {
    bot.setControlState('back', true);
    await sleep(150);
    bot.setControlState('back', false);
  }
  if (bot.entity.position.distanceTo(firingPos) > 1.4) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(firingPos.x, firingPos.y, firingPos.z, 0.5));
    } catch (e) {}
  }

  // 1. Immediate priority: Flanking melee threats (Piglins, Wither Skeletons)
  const flankers = Object.values(bot.entities).filter(e =>
    e.isValid && (e.health === undefined || e.health > 0) &&
    ['piglin', 'wither_skeleton', 'zombified_piglin', 'magma_cube'].includes(e.name) &&
    bot.entity.position.distanceTo(e.position) <= 4.5
  );

  // 2. Focused Blaze Target Lock
  const blazes = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'blaze' && (e.health === undefined || e.health > 0)
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  // Stick to current locked target until dead or out of range
  let target = flankers[0];
  if (!target) {
    const locked = blazes.find(b => b.id === lockedTargetId && bot.entity.position.distanceTo(b.position) <= 4.8);
    if (locked) {
      target = locked;
    } else {
      const nearest = blazes.find(b => bot.entity.position.distanceTo(b.position) <= 4.8);
      if (nearest) {
        target = nearest;
        lockedTargetId = nearest.id;
      } else {
        lockedTargetId = null;
      }
    }
  }

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
    } else {
      bot.activateItem(true);
    }
  } else if (blazes[0]) {
    // Face nearest Blaze to block fireballs with shield
    await bot.lookAt(blazes[0].position.offset(0, (blazes[0].height || 1.8) * 0.7, 0), true);
    bot.activateItem(true);
  } else {
    // Face spawner at (32, 68, -190)
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // 3. Drop Vacuum on Balcony Deck (x >= 32.0, z >= -191.0, z <= -185.0, dist <= 5.5m)
  const items = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 5.5 &&
    e.position.x >= 32.0 &&
    e.position.z >= -191.0 &&
    e.position.z <= -185.0
  );
  for (const it of items) {
    const floorBlock = bot.blockAt(it.position.offset(0, -0.5, 0));
    if (floorBlock && floorBlock.boundingBox === 'block') {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.4));
        await sleep(200);
      } catch (e) {}
    }
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

// Keep shield raised after combat loop
bot.activateItem(true);

const finalRods = lib.count('blaze_rod');
console.log(`Combat cycle end. Hits: ${hits}, Rods: ${finalRods}/${TARGET_RODS}, HP: ${bot.health}`);
bot.chat(`Beta: Combat round complete. Blaze Rods held: ${finalRods}/${TARGET_RODS}, HP: ${bot.health.toFixed(1)}`);

// If 8+ rods secured, retreat to Overworld base!
if (finalRods >= TARGET_RODS) {
  bot.chat(`Beta: 8+ Blaze Rods secured! Retreating to Overworld base!`);
  const WAYPOINTS = [
    { x: 38, y: 65, z: -176 },
    { x: 44, y: 65, z: -169 },
    { x: 44, y: 65, z: -160 },
    { x: 44, y: 65, z: -145 },
    { x: 44, y: 65, z: -127 },
    { x: 50, y: 65, z: -115 },
    { x: 61, y: 66, z: -100 },
    { x: 62.0, y: 67, z: -80 },
    { x: 61.5, y: 67, z: -75 },
    { x: 61.5, y: 67, z: -65 },
    { x: 62, y: 67, z: -50 },
    { x: 63, y: 66, z: -35 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 64, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 46, y: 65, z: -7 },
    { x: 40, y: 65, z: -7 }
  ];
  for (const wp of WAYPOINTS) {
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
  hp: bot.health
};
