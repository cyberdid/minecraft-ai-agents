// delta/autoload.js - Delta's private extensions & fixes
console.log('[delta/autoload] Initializing Delta autoload extensions...');

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// Override retreatToOverworldBase with dynamic closest-waypoint resolution
globalThis.retreatToOverworldBase = async function() {
  if (bot.game.dimension === 'the_nether') {
    globalThis.configureFireAvoidance();
    
    // Find closest waypoint index to start retreating from (so we don't march forward to pillbox if already south)
    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
      const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
      const d = bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z));
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }

    console.log(`[retreatToOverworldBase] Retreating from WP ${closestIdx} down to 0...`);
    for (let i = closestIdx; i >= 0 && !checkCancelled(); i--) {
      const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
      const v = new Vec3(wp.x, wp.y, wp.z);
      if (bot.entity.position.distanceTo(v) < 2.5) continue;
      try {
        await globalThis.clearFireAhead();
        await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
      } catch (e) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
        } catch (e2) {}
      }
    }

    // Portal warp
    console.log('[retreatToOverworldBase] Approaching Nether Portal block...');
    const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
    if (portalBlock) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);
      const warpStart = Date.now();
      while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
        await sleep(300);
      }
    } else {
      // Step towards (46.5, 66.0, 2.0)
      try { await bot.pathfinder.goto(new goals.GoalNear(46.5, 66.0, 2.0, 1.0)); } catch (e) {}
    }
  }

  if (bot.game.dimension === 'overworld') {
    console.log('[retreatToOverworldBase] Arrived in Overworld, moving to Base (293, 72, -55)...');
    try { await lib.goTo(293, 72, -55, 2, { timeoutMs: 12000 }); } catch (e) {}
  }

  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};
