// programs/703-fortified-spawner-strike.js
console.log('=== Program 703: Fortified Spawner Strike ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Blaze Rods currently held:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Step outside base door and mine 20 cobblestone
console.log('Stepping outside base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -52, 1.0, { timeoutMs: 5000 }); } catch (e2) {}
}

const sp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (sp) await bot.equip(sp, 'hand');

if (lib.count('cobblestone') < 30) {
  console.log(`Mining stone (have ${lib.count('cobblestone')})...`);
  let mined = 0;
  while (lib.count('cobblestone') < 30 && mined < 25 && !isCancelled()) {
    const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
    if (stone) {
      try {
        await bot.dig(stone, true);
        await sleep(80);
        mined++;
      } catch (e) { break; }
    } else { break; }
  }
  await lib.pickup(5);
  console.log(`Cobblestone ready: ${lib.count('cobblestone')}`);
}

// 2. Warp into Nether
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

// Step away from Nether portal
await sleep(400);
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 3. March waypoints strictly in corridor center
configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: Reinforced with ${lib.count('cobblestone')} cobble! Marching to Spawner Pillbox to join team!`);

const waypoints = NETHER_PILLBOX_WAYPOINTS;
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (err2) {}
  }
  try { await lib.pickup(3.5); } catch (e) {}

  // When reaching WP 15 at (38, 65, -176), seal west blind spot at (38, 66..67, -176)
  if (i === 14 && lib.count('cobblestone') > 5) {
    for (const y of [66, 67]) {
      const p = new Vec3(38, y, -176);
      const b = bot.blockAt(p);
      if (b && b.name === 'air') {
        try {
          await lib.place('cobblestone', p.x, p.y, p.z);
          console.log(`Sealed west blind spot at ${lib.fmt(p)}!`);
        } catch (e) {}
      }
    }
  }

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, holding cover.`);
    break;
  }
}

console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Enter Pillbox at (36.0, 66.0, -186.5)
try {
  await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 5000 });
} catch (e) {}

if (sword) await bot.equip(sword, 'hand');
console.log('Beta in Pillbox:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`Beta: In Spawner Pillbox! Slaying Blazes shoulder-to-shoulder with team!`);

// 5. Combat Loop
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
    console.log(`Milestone 8 complete with ${curRods} rods!`);
    break;
  }

  await sleep(150);
}

try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('Program 703 complete. Blaze Rods:', finalRods, 'Kills:', killed, 'HP:', bot.health);

if (finalRods >= targetRods) {
  bot.chat(`Beta: Retreating to Overworld Base with ${finalRods} Blaze Rods!`);
  await retreatToOverworldBase();
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  killed,
  hp: bot.health
};
