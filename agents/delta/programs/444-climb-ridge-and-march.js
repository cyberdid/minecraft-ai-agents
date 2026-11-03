// programs/444-climb-ridge-and-march.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Equip shield in offhand and sword in main hand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand:', offhand?.name, 'Held:', bot.heldItem?.name);

// 2. Configure pathfinder with fire avoidance and tower building
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
moves.allow1by1towers = true;
// Allow using soul_sand to scaffold
if (mcData.itemsByName.soul_sand) moves.scafoldingBlocks.push(mcData.itemsByName.soul_sand.id);
bot.pathfinder.setMovements(moves);

// 3. If below ridge (y < 66), climb back up to (62, 67, -65)
if (bot.entity.position.y < 66.0 && bot.entity.position.z > -80) {
  console.log('Climbing back to ridge at (62, 67, -65)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(62, 67, -65, 1.5));
    console.log('Back on ridge! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Climb ridge error:', e.message);
  }
}

// 4. March waypoints from ridge to Spawner Pillbox
const WAYPOINTS = [
  { x: 62, y: 67, z: -65 },  // 6
  { x: 62, y: 67, z: -80 },  // 7
  { x: 61, y: 66, z: -100 }, // 8
  { x: 50, y: 65, z: -115 }, // 9
  { x: 44, y: 65, z: -127 }, // 10 (Fortress Workshop Bunker)
  { x: 44, y: 65, z: -145 }, // 11 (Covered Tunnel)
  { x: 44, y: 65, z: -160 }, // 12
  { x: 44, y: 65, z: -169 }, // 13
  { x: 38, y: 65, z: -176 }, // 14
  { x: 36.5, y: 66, z: -187 } // 15 (Inside Pillbox under roof)
];

let startIdx = 0;
for (let i = 0; i < WAYPOINTS.length; i++) {
  if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
    startIdx = i + 1;
  }
}

console.log(`Marching from WP index ${startIdx}...`);
for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  console.log(`Marching to WP (${wp.x}, ${wp.y}, ${wp.z})...`);
  let timer = null;
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 12000); })
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

  try { await lib.pickup(3.0); } catch (e) {}
}

console.log('March complete. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 5. Shield-Defended Combat at Pillbox (36.5, 66.0, -187.0)
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0));
if (distToPillbox < 6.0) {
  bot.chat('delta: Inside Spawner Pillbox with Shield! Slaying Blazes for Milestone 8.');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
  } catch (e) {}

  bot.activateItem(true);
  console.log('Shield raised in offhand!');

  const farmDurationMs = 180000;
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;

  console.log(`Shielded combat active. Starting rods: ${lastRods}`);

  while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        bot.deactivateItem();
        try { await lib.equipWeapon(); } catch (e) {}
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        hits++;
        console.log(`Hit Blaze at dist ${dist.toFixed(1)}m (hit #${hits})`);
        await sleep(50);
        bot.activateItem(true);
      }
    }

    const safeItems = Object.values(bot.entities).filter(e => 
      e.name === 'item' && 
      bot.entity.position.distanceTo(e.position) <= 2.5 &&
      e.position.x >= 36.0 &&
      e.position.z <= -186.0
    );
    for (const item of safeItems) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      console.log('Milestone 8 target reached: 8+ Blaze Rods!');
      break;
    }

    await sleep(100);
  }

  const totalRods = lib.count('blaze_rod');
  console.log(`Combat cycle end. Total hits: ${hits}, Rods: ${totalRods}/8, HP: ${bot.health}`);
  bot.chat(`delta: Combat round complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

  if (totalRods >= 8) {
    bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base.');
    console.log('Retreating to Overworld base...');
    const retRes = await retreatToOverworldBase();
    console.log('Retreat result:', JSON.stringify(retRes));

    if (bot.game.dimension === 'overworld') {
      try {
        await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
        bot.chat('delta: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
      } catch (e) {}
    }
  }
}
