console.log('=== MONITOR ALPHA AND NIGHT PROTOCOL ===');

for (let i = 0; i < 25; i++) {
  const timeInfo = lib.time();
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

  const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'alpha');
  const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
  const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'gamma');

  console.log(`[t=${i*2}s] night in ${timeInfo.secondsUntilNight}s | Sill: ${sill?.name} | Portal: ${portal ? 'ACTIVE' : 'none'} | Alpha: ${alpha ? lib.fmt(alpha.position) + ' (held: ' + (alpha.heldItem?.name || 'none') + ')' : 'out of range'}`);

  // If portal is lit, ignite or enter!
  if (portal) {
    console.log('PORTAL ACTIVE! Entering...');
    bot.chat('delta: Portal is active! Warping to Nether!');
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
    await sleep(4500);
    break;
  }

  // If sill became obsidian and portal not lit, ignite!
  if (sill && sill.name === 'obsidian' && !portal) {
    console.log('Obsidian present! Igniting...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(1000);
      const p = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (p) {
        bot.chat('delta: Ignited portal! Entering...');
        await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
        await sleep(4500);
        break;
      }
    } catch (e) {
      console.log('Ignite error:', e.message);
    }
  }

  // Night safety check: if night in < 80s, retreat inside base near bed 2
  if (timeInfo.secondsUntilNight < 80) {
    console.log('Night approaching (<80s)! Moving inside base near bed 2...');
    if (bot.entity.position.z > -54.0) {
      try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
    }
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -56.0, 1.0));
    } catch (e) {}

    // Check if can sleep
    if (timeInfo.canSleep) {
      console.log('Night reached! Attempting to sleep in bed 2...');
      const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 6 });
      if (bed) {
        try {
          await bot.sleep(bed);
          console.log('Sleeping in bed...');
          await sleep(5000);
        } catch (e) {
          console.log('Sleep error:', e.message);
        }
      }
    }
  }

  await sleep(2000);
}

console.log('Status at program end: dimension =', bot.game.dimension, 'pos =', lib.fmt(bot.entity.position), 'hp =', bot.health);
