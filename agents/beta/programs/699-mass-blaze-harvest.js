// programs/699-mass-blaze-harvest.js
console.log('=== Program 699: Mass Blaze Rod Harvest ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Starting Blaze Rods:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Mine 25 cobblestone if in Overworld
if (bot.game.dimension === 'overworld' && lib.count('cobblestone') < 35) {
  console.log(`Mining cobblestone (have: ${lib.count('cobblestone')})...`);
  const sp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (sp) await bot.equip(sp, 'hand');
  let mined = 0;
  while (lib.count('cobblestone') < 35 && mined < 30 && !isCancelled()) {
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
  console.log(`Mined ${mined} cobblestone. Current total: ${lib.count('cobblestone')}`);
}

// 2. Warp through Nether Portal
if (bot.game.dimension === 'overworld') {
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

// 3. March safe waypoints
configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: Marching to Spawner Pillbox! Current Blaze Rods: ${lib.count('blaze_rod')}/8`);

const waypoints = NETHER_PILLBOX_WAYPOINTS;
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

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

// 4. Complete blast roof over pillbox at y=68
console.log('Sealing remaining pillbox roof at y=68...');
const roofCoords = [
  new Vec3(36, 68, -185),
  new Vec3(36, 68, -186),
  new Vec3(36, 68, -187),
  new Vec3(37, 68, -184),
  new Vec3(36, 68, -184),
  new Vec3(35, 68, -184)
];

for (const p of roofCoords) {
  const b = bot.blockAt(p);
  if (b && b.name === 'air' && lib.count('cobblestone') > 2) {
    try {
      await lib.place('cobblestone', p.x, p.y, p.z);
      console.log(`Placed roof block at ${lib.fmt(p)}`);
    } catch (e) {
      console.log(`Roof note at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// 5. Position behind firing breastwork at (36.0, 66.0, -186.5)
try {
  await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 5000 });
} catch (e) {}

if (sword) await bot.equip(sword, 'hand');
console.log('Beta positioned at firing slit:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`Beta: At Pillbox firing slit! Engaging Blazes for Milestone 8 (Blaze Rods)!`);

// 6. Intensive Blaze Slaying Loop
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

  // Find Blazes within melee reach (<= 4.8 blocks)
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

  // Periodic pickup for blaze rods
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
    console.log(`Target reached: ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(150);
}

try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('Combat cycle complete.');
console.log('Blaze Rods in inventory:', finalRods, 'Kills:', killed, 'HP:', bot.health);

if (finalRods >= targetRods) {
  bot.chat(`Beta: Retreating to Overworld Base with ${finalRods} Blaze Rods!`);
  await retreatToOverworldBase();
}

return {
  rods: finalRods,
  killed,
  hp: bot.health,
  pos: bot.entity.position
};
