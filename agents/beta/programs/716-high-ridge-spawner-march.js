// programs/716-high-ridge-spawner-march.js
console.log('=== Program 716: High Ridge Spawner March ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Blaze Rods in inventory:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Enter Nether Portal if in Overworld
if (bot.game.dimension === 'overworld') {
  console.log('Sprinting to Nether Portal at (299.5, 73.0, -54.0)...');
  try {
    await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 8000 }); } catch (e2) {}
  }

  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (cur.distanceTo(portalTarget) > 0.8) {
      await bot.lookAt(portalTarget, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(350);
  }
  bot.clearControlStates();
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether (current: ${bot.game.dimension})`);
}

// Step away from Nether portal into base camp
await sleep(400);
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 2. High-precision safe ridge waypoints (stays strictly at y=67, x=61.5 across z=-50..-80)
const SAFE_NETHER_WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  // High Ridge Ridge spine (strictly x=61.5, y=67 to avoid west slope fire pit)
  { x: 61.5, y: 67, z: -55 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -75 },
  { x: 62.0, y: 67, z: -80 },
  // Advance to Fortress Workshop Bunker
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Fortress Bunker Entrance
  // Covered Tunnel (100% blast-proof walls & roof)
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 },
  // Cross bridge to Pillbox
  { x: 38, y: 65, z: -176 },
  { x: 36, y: 66, z: -187 }  // Spawner Pillbox
];

configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: In Nether! High-precision ridge march to Spawner Pillbox active! Current rods: ${lib.count('blaze_rod')}/8`);
console.log('Starting high-precision ridge march...');

for (let i = 0; i < SAFE_NETHER_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = SAFE_NETHER_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  console.log(`WP ${i + 1}/${SAFE_NETHER_WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z}), dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 9000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 5000 }); } catch (e2) {}
  }

  // Extinguish any adjacent fire block on the path
  const fireBlocks = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 3,
    count: 3
  });
  for (const fp of fireBlocks) {
    try {
      console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
      await lib.dig(fp.x, fp.y, fp.z);
    } catch (e) {}
  }

  try { await lib.pickup(3.5); } catch (e) {}
}

console.log('Ridge march complete. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Move directly inside Pillbox behind breastwork at (36.0, 66.0, -186.5)
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(new Vec3(36, 66, -187)) < 15) {
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 5000 });
  } catch (e) {}

  if (sword) await bot.equip(sword, 'hand');
  console.log('In Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  bot.chat(`Beta: In Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods)!`);

  // 4. Combat Loop
  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  while (!isCancelled() && Date.now() - farmStart < 120000 && bot.game.dimension === 'the_nether') {
    if (bot.health <= 6) {
      await sleep(1000);
      continue;
    }

    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.5, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze slain! Kills: ${killed}`);
        }
      }
    }

    if (Math.random() < 0.25) {
      try { await lib.pickup(3.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }

    if (curRods >= targetRods) {
      bot.chat(`Beta: Milestone 8 COMPLETED! ${curRods} Blaze Rods secured!`);
      break;
    }

    await sleep(150);
  }

  try { await lib.pickup(4.0); } catch (e) {}

  const finalRods = lib.count('blaze_rod');
  console.log('Combat cycle complete.');
  console.log('Blaze Rods in inventory:', finalRods, 'Kills:', killed, 'HP:', bot.health);

  if (finalRods >= targetRods) {
    bot.chat(`Beta: Milestone 8 Complete! Retreating to Base with ${finalRods} Blaze Rods!`);
    await retreatToOverworldBase();
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health
};
