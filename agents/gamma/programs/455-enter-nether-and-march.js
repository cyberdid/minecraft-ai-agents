// programs/455-enter-nether-and-march.js
console.log('=== ENTER NETHER & MARCH TO PILLBOX (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Enter Nether portal if in Overworld
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Stepping through Nether portal to join team at Spawner Pillbox!');
  console.log('Entering Nether Portal via enterNetherPortal()...');
  const warp = await globalThis.enterNetherPortal();
  console.log('Warp result:', warp);
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Dimension is not the_nether. Halting.');
  return { dim: bot.game.dimension, pos: bot.entity.position };
}

console.log('Successfully in the_nether at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 2. Configure fire avoidance movements (moves.blocksToAvoid.add fire & soul_fire)
globalThis.configureFireAvoidance();
try { await lib.equipWeapon(); } catch (e) {}

// Initial descent from portal deck (45, 75, -15) to bunker at (46, 65, -7)
try {
  await lib.goTo(46, 65, -7, 2.0, { dig: false, timeoutMs: 12000 });
} catch (e) {
  console.log('Descent note:', e.message);
}

const waypoints = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61, y: 67, z: -65 },
  { x: 62, y: 67, z: -80 },
  { x: 61.5, y: 66, z: -90 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Fortress Workshop
  { x: 44, y: 65, z: -145 }, // Covered Tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast Wall
  { x: 38, y: 65, z: -176 }, // Cross Bridge
  { x: 37, y: 66, z: -184 }, // Pillbox Covered Entry
  { x: 36.8, y: 66, z: -186.5 } // Spawner Pillbox Firing Station
];

bot.chat('gamma: In Nether! Fast marching via safe covered East Ridge trail to Spawner Pillbox (36, 66, -187)...');

// 3. March through waypoints with dimension safety check
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') {
    console.log('CRITICAL: Dimension changed (player respawned in overworld). Stopping Nether march!');
    break;
  }

  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  const dist = bot.entity.position.distanceTo(target);

  if (dist < 2.2) {
    console.log(`Already at WP ${i + 1}/${waypoints.length} (${wp.x}, ${wp.y}, ${wp.z})`);
    continue;
  }

  console.log(`Marching to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z}) [dist: ${dist.toFixed(1)}m, HP: ${bot.health.toFixed(1)}]`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 14000 });
  } catch (err) {
    console.log(`goTo note at WP ${i + 1}, using directional nudge: ${err.message}`);
    await bot.lookAt(target.offset(0.5, 1, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(900);
    bot.setControlState('forward', false);
    bot.clearControlStates();
  }

  try { await lib.pickup(3.0); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, taking cover to regenerate.`);
    await sleep(4000);
  }
}

console.log('End of march reached! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Pillbox combat loop
if (bot.game.dimension === 'the_nether') {
  const pillboxPos = new Vec3(36.8, 66.0, -186.5);
  const pillboxDist = bot.entity.position.distanceTo(pillboxPos);
  console.log(`Distance to Pillbox station: ${pillboxDist.toFixed(1)}m`);

  if (pillboxDist <= 8.0) {
    bot.chat('gamma: Inside Spawner Pillbox! Slaying Blazes shoulder-to-shoulder with team for Milestone 8!');

    const farmStart = Date.now();
    const targetRods = 8;
    let lastRods = lib.count('blaze_rod');
    let lastAttack = 0;
    let killed = 0;

    while (!isCancelled() && Date.now() - farmStart < 120000) {
      if (bot.game.dimension !== 'the_nether') break;

      // Cover retreat if health drops low
      if (bot.health < 8) {
        console.log(`HP low (${bot.health.toFixed(1)}), taking cover behind wall at z=-184...`);
        try { await lib.goTo(37, 66, -184, 1.0, { dig: false, timeoutMs: 3000 }); } catch (e) {}
        await sleep(4000);
        try { await lib.goTo(36.8, 66, -186.5, 1.0, { dig: false, timeoutMs: 3000 }); } catch (e) {}
        continue;
      }

      const blazes = Object.values(bot.entities)
        .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
        .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

      const target = blazes[0];
      if (target) {
        const d = bot.entity.position.distanceTo(target.position);
        if (d <= 5.0 && Date.now() - lastAttack > 625) {
          await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
          bot.attack(target);
          lastAttack = Date.now();
          if (target.health !== undefined && target.health <= 0) {
            killed++;
            console.log(`Blaze eliminated! Total kills = ${killed}`);
          }
        }
      }

      // Safe pickup: vacuum dropped Blaze Rods
      if (bot.entity.position.x >= 35.5 && Math.random() < 0.3) {
        try { await lib.pickup(3.5); } catch (e) {}
      }

      const curRods = lib.count('blaze_rod');
      if (curRods > lastRods) {
        bot.chat(`gamma: Blaze Rod harvested! Total: ${curRods}/${targetRods}`);
        lastRods = curRods;
        console.log(`*** BLAZE ROD ACQUIRED! Count = ${curRods} ***`);
      }

      if (curRods >= targetRods) {
        bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${curRods} Blaze Rods!`);
        break;
      }

      await sleep(120);
    }

    try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.5); } catch (e) {}
    console.log(`Pillbox combat complete. Kills: ${killed}, Rods held: ${lib.count('blaze_rod')}`);
  }
}

const finalRods = lib.count('blaze_rod');
bot.chat(`gamma: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
