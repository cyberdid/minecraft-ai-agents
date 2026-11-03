// programs/694-mine-cobble-and-fortify-assault.js
console.log('=== Program 694: Mine Cobblestone & Fortified Spawner Assault ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Mine cobblestone up to 48 blocks
const targetCobble = 48;
if (lib.count('cobblestone') < targetCobble) {
  console.log(`Mining cobblestone (current: ${lib.count('cobblestone')}, target: ${targetCobble})...`);
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  let mined = 0;
  while (lib.count('cobblestone') < targetCobble && mined < 40 && !isCancelled()) {
    const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
    if (stone) {
      try {
        await bot.dig(stone, true);
        await sleep(100);
        mined++;
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }
  await lib.pickup(5);
  console.log(`Mined ${mined} stone. Current cobble: ${lib.count('cobblestone')}`);
}

// 2. Warp through Nether Portal
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 8000 });
} catch (e) {}

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

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether (current: ${bot.game.dimension})`);
}

// Step away from Nether portal into base camp
await sleep(400);
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 3. March through safe waypoints
configureFireAvoidance();
try { await lib.equipWeapon(); } catch (e) {}

bot.chat('Beta: Reinforced with 40+ cobblestone! Marching to Spawner Pillbox (36, 66, -187)...');
console.log('Marching safe waypoints...');

const waypoints = NETHER_PILLBOX_WAYPOINTS;
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

  console.log(`WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (err2) {}
  }
  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, holding cover.`);
    break;
  }
}

console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Enter Pillbox at (37, 66, -186)
try {
  await lib.goTo(37.0, 66.0, -186.0, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {}

// 5. Fortify Roof over Pillbox: place cobblestone at y=68 if open air
console.log('Verifying Pillbox roof cover at y=68...');
const roofSpots = [
  new Vec3(37, 68, -186),
  new Vec3(36, 68, -186),
  new Vec3(37, 68, -185),
  new Vec3(36, 68, -185)
];

for (const p of roofSpots) {
  const b = bot.blockAt(p);
  if (b && b.name === 'air' && lib.count('cobblestone') > 10) {
    try {
      console.log(`Placing roof cover block at ${lib.fmt(p)}...`);
      await lib.place('cobblestone', p.x, p.y, p.z);
    } catch (e) {
      console.log(`Roof placement note at ${lib.fmt(p)}:`, e.message);
    }
  }
}

bot.chat('Beta: Pillbox fortified with overhead blast cover! Engaging Blazes...');

// 6. Combat Loop
const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - farmStart < 120000) {
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
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Blaze slain! Kills: ${killed}`);
      }
    }
  }

  if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
    try { await lib.pickup(2.5); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
  }

  if (curRods >= targetRods) {
    bot.chat(`Beta: 8 Blaze Rods obtained! Milestone 8 achieved!`);
    console.log('Milestone 8 complete!');
    break;
  }

  await sleep(150);
}

try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('Expedition finished. Blaze Rods:', finalRods, 'Kills:', killed, 'HP:', bot.health);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  killed,
  hp: bot.health
};
