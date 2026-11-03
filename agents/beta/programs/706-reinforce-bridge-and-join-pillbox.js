// programs/706-reinforce-bridge-and-join-pillbox.js
console.log('=== Program 706: Reinforce Bridge & Join Pillbox ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Blaze Rods in inv:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Enter Nether Portal
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

// 2. March waypoints strictly in Nether
configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: In Nether! Marching to Spawner Pillbox to reinforce bridge and slay Blazes!`);

const waypoints = NETHER_PILLBOX_WAYPOINTS;
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

  console.log(`WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
  try { await lib.pickup(3.5); } catch (e) {}

  // Mine 10 netherrack quickly in covered tunnel at WP 12 (z=-145) if low on blocks
  if (i === 11 && lib.count('netherrack') < 10 && bot.game.dimension === 'the_nether') {
    const sp = bot.inventory.items().find(it => it.name.includes('pickaxe'));
    if (sp) await bot.equip(sp, 'hand');
    for (let d = 0; d < 10; d++) {
      const nr = bot.findBlock({ matching: mcData.blocksByName.netherrack.id, maxDistance: 4.0 });
      if (nr && nr.position.y >= 65 && nr.position.x !== 44) {
        try { await bot.dig(nr, true); await sleep(40); } catch (e) { break; }
      }
    }
    await lib.pickup(4);
    if (sword) await bot.equip(sword, 'hand');
  }

  // At WP 14 / 15: seal west edge at (38..39, 66..67, -176)
  if (i === 14 && bot.game.dimension === 'the_nether' && (lib.count('cobblestone') > 2 || lib.count('netherrack') > 2)) {
    const mat = lib.count('netherrack') > 0 ? 'netherrack' : 'cobblestone';
    for (const x of [39, 38]) {
      for (const y of [66, 67]) {
        const p = new Vec3(x, y, -176);
        const b = bot.blockAt(p);
        if (b && b.name === 'air') {
          try {
            await lib.place(mat, p.x, p.y, p.z);
            console.log(`Placed blast shield at ${lib.fmt(p)}`);
          } catch (e) {}
        }
      }
    }
  }

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, taking brief cover.`);
    await sleep(2500);
  }
}

console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Move directly inside Pillbox behind breastwork at (36.0, 66.0, -186.5)
if (bot.game.dimension === 'the_nether') {
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 5000 });
  } catch (e) {}

  if (sword) await bot.equip(sword, 'hand');
  console.log('In Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  bot.chat(`Beta: In Spawner Pillbox! Fighting alongside Delta & Gamma for Milestone 8!`);

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
