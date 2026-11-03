// programs/701-pillbox-mastery-and-harvest.js
console.log('=== Program 701: Pillbox Mastery & Blaze Rod Harvest ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Starting Blaze Rods:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Step down from portal roof if on top
if (bot.entity.position.y > 67) {
  console.log('Stepping down from portal roof...');
  try {
    await lib.goTo(46, 65, -7, 1.5, { timeoutMs: 5000 });
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

// 2. March through waypoints
configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: Marching to Blaze Spawner Pillbox! Current rods: ${lib.count('blaze_rod')}/8`);

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

  // Mine 15 netherrack in covered tunnel at WP 12 (z=-145) for fortification
  if (i === 11 && lib.count('netherrack') < 16) {
    console.log('Mining 16 netherrack from tunnel wall for blast fortifications...');
    const sp = bot.inventory.items().find(it => it.name.includes('pickaxe'));
    if (sp) await bot.equip(sp, 'hand');
    let dug = 0;
    while (lib.count('netherrack') < 16 && dug < 20 && !isCancelled()) {
      const nr = bot.findBlock({ matching: mcData.blocksByName.netherrack.id, maxDistance: 4.0 });
      if (nr && (nr.position.y >= 65 || nr.position.x !== 44)) {
        try {
          await bot.dig(nr, true);
          await sleep(50);
          dug++;
        } catch (e) { break; }
      } else { break; }
    }
    await lib.pickup(4);
    if (sword) await bot.equip(sword, 'hand');
    console.log(`Mined ${dug} netherrack. Total cover blocks: ${lib.count('netherrack') + lib.count('cobblestone')}`);
  }

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, taking cover.`);
    break;
  }
}

console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Complete blast roof over pillbox at y=68
console.log('Sealing pillbox roof at y=68...');
const roofCoords = [
  new Vec3(36, 68, -185),
  new Vec3(36, 68, -186),
  new Vec3(36, 68, -187),
  new Vec3(37, 68, -184),
  new Vec3(36, 68, -184),
  new Vec3(35, 68, -184),
  new Vec3(35, 68, -185),
  new Vec3(35, 68, -186),
  new Vec3(35, 68, -187)
];

const buildMaterial = lib.count('netherrack') > 0 ? 'netherrack' : 'cobblestone';
for (const p of roofCoords) {
  const b = bot.blockAt(p);
  if (b && b.name === 'air' && (lib.count('netherrack') > 0 || lib.count('cobblestone') > 2)) {
    try {
      const mat = lib.count('netherrack') > 0 ? 'netherrack' : 'cobblestone';
      await lib.place(mat, p.x, p.y, p.z);
      console.log(`Placed roof block at ${lib.fmt(p)}`);
    } catch (e) {
      // ignore
    }
  }
}

// 4. Move directly behind firing breastwork at (36.0, 66.0, -186.5)
try {
  await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 5000 });
} catch (e) {}

if (sword) await bot.equip(sword, 'hand');
console.log('Beta positioned at firing slit:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`Beta: In Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods)!`);

// 5. Intensive Blaze Slaying Loop
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

  // Sweep items within reach
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
