// programs/719-fortify-pillbox-and-harvest-rods.js
console.log('=== Program 719: Fortify Pillbox & Blaze Rod Harvest ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Blaze Rods in inventory:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Enter Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 10000 }); } catch (e2) {}
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
    await sleep(400);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether (current: ${bot.game.dimension})`);
}

console.log('In Nether! Pos:', lib.fmt(bot.entity.position));

// Step out of Nether portal bunker into base camp
if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
}

// 2. Active Fire Extinguisher
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

// 3. March through safe waypoints
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
  { x: 44, y: 65, z: -127 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 },
  { x: 38, y: 65, z: -176 },
  { x: 36.5, y: 66, z: -187 }
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: Marching to Spawner Pillbox! Current Blaze Rods: ${lib.count('blaze_rod')}/8`);

for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await clearFireAhead();

  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  console.log(`WP ${i + 1}/${WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  let timer = null;
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 8000); })
    ]);
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.lookAt(target.offset(0.5, 1, 0.5), true);
      bot.setControlState('forward', true);
      if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
      await sleep(1200);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    } catch (e2) {}
  } finally {
    if (timer) clearTimeout(timer);
  }

  await clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}
}

console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Secure Pillbox Position & Place East Guardrail Wall at x=38
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(new Vec3(36.5, 66, -187)) < 10) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -186.5, 0.5));
  } catch (e) {}

  // Place East guardrail wall at x=38, y=66..67 to completely prevent falling off!
  console.log('Placing East guardrail wall along x=38...');
  const guardrailSpots = [
    new Vec3(38, 66, -185),
    new Vec3(38, 67, -185),
    new Vec3(38, 66, -186),
    new Vec3(38, 67, -186),
    new Vec3(38, 66, -187),
    new Vec3(38, 67, -187)
  ];

  for (const gp of guardrailSpots) {
    const b = bot.blockAt(gp);
    if (b && b.name === 'air' && (lib.count('cobblestone') > 2 || lib.count('soul_sand') > 2)) {
      const mat = lib.count('cobblestone') > 2 ? 'cobblestone' : 'soul_sand';
      try {
        await lib.place(mat, gp.x, gp.y, gp.z);
        console.log(`Placed guardrail at ${lib.fmt(gp)}`);
      } catch (e) {}
    }
  }

  if (sword) await bot.equip(sword, 'hand');
  bot.chat('Beta: Pillbox fortified with East guardrail! Slaying Blazes shoulder-to-shoulder with team!');

  // 5. Stationary Combat Loop
  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  while (!isCancelled() && Date.now() - farmStart < 120000 && bot.game.dimension === 'the_nether') {
    // Keep strictly stationary at (36.5, 66.0, -186.5)
    if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -186.5)) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -186.5, 0.4));
      } catch (e) {}
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

    // Safe stationary pickup
    if (Math.random() < 0.25) {
      try { await lib.pickup(3.0); } catch (e) {}
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
  console.log('Combat cycle complete. Blaze Rods:', finalRods, 'Kills:', killed, 'HP:', bot.health);

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
