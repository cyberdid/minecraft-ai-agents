// programs/714-install-overrides-and-test.js
console.log('=== Program 714: Install Overrides on globalThis ===');

// 1. Override enterNetherPortal
globalThis.enterNetherPortal = async function(timeoutMs = 25000) {
  if (bot.game.dimension === 'the_nether') return { dimension: 'the_nether', pos: bot.entity.position };
  try {
    await lib.goTo(299, 73, -52, 2, { timeoutMs: 15000 });
  } catch (e) {}

  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(1500);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - start < timeoutMs) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.8 || Math.abs(cur.z - (-54.0)) > 0.8 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(400);
  }

  bot.clearControlStates();
  if (bot.game.dimension === 'the_nether') {
    await sleep(500);
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1200);
    bot.setControlState('forward', false);
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position };
};

// 2. Override marchToSpawnerPillbox
globalThis.marchToSpawnerPillbox = async function() {
  if (bot.game.dimension === 'overworld') {
    await globalThis.enterNetherPortal();
  }
  if (bot.game.dimension !== 'the_nether') {
    throw new Error('Not in the_nether after enterNetherPortal');
  }
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const v = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(v) < 3.0) continue;
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 12000 });
    } catch (e) {
      try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 }); } catch (e2) {}
    }
    try { await lib.pickup(3.5); } catch (e) {}
    if (bot.health <= 7) {
      console.log(`Health low (${bot.health}) during march at WP ${i + 1}, stopping in cover.`);
      break;
    }
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};

// 3. Override farmBlazeRodsAtPillbox
globalThis.farmBlazeRodsAtPillbox = async function(targetRods = 8, durationMs = 90000) {
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  const start = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  console.log(`Farming Blazes at Pillbox. Initial rods: ${lastRods}/${targetRods}, HP: ${bot.health}`);

  while (Date.now() - start < durationMs) {
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
          console.log(`Blaze slain! Total killed: ${killed}`);
        }
      }
    }
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
      try { await lib.pickup(2.5); } catch (e) {}
    }
    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`${bot.username}: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }
    if (curRods >= targetRods) {
      console.log(`Target rods ${curRods}/${targetRods} reached!`);
      break;
    }
    await sleep(150);
  }
  try { if (bot.entity.position.x >= 35.5) await lib.pickup(2.5); } catch (e) {}
  return { killed, rods: lib.count('blaze_rod'), hp: bot.health, pos: bot.entity.position };
};

console.log('Overrides successfully installed on globalThis!');
return { ok: true };
