console.log('=== STANDBY AT PORTAL FRAME TO IGNITE AND WARP ===');

// Exit base door to portal exterior
if (bot.entity.position.z < -54.0) {
  console.log('Stepping through base door to portal exterior...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 0.8));
} catch (e) {}

const sillPos = new Vec3(299, 72, -54);
const portalPos = new Vec3(299, 73, -54);

const start = Date.now();
let portal = null;

while (!isCancelled() && Date.now() - start < 45000) {
  portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portal) {
    console.log('NETHER PORTAL IS ALREADY ACTIVE!');
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sill2 = bot.blockAt(new Vec3(300, 72, -54));

  // Check players nearby
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
  const pStr = players.map(p => `${p.username}@${lib.fmt(p.position)}`).join(', ');

  console.log(`[${Math.round((Date.now() - start)/1000)}s] Sill: ${sill?.name}, Sill2: ${sill2?.name} | Players: ${pStr}`);

  if (sill && sill.name === 'obsidian' && sill2 && sill2.name === 'obsidian') {
    console.log('Both sills are obsidian! Attempting ignite...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(1000);
      portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (portal) {
        bot.chat('delta: NETHER PORTAL IGNITED BY DELTA! Entering portal now!');
        break;
      }
    } catch (err) {
      console.log('Ignite attempt error:', err.message);
    }
  }

  await sleep(1200);
}

if (portal) {
  console.log('Entering portal block and standing motionless...');
  await bot.lookAt(portalPos, true);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalPos.x, portalPos.y, portalPos.z));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(300);
  }

  console.log(`Dimension after warp: ${bot.game.dimension}`);
  if (bot.game.dimension === 'the_nether') {
    configureFireAvoidance();
    bot.chat('delta: In the_nether! Moving to Fortress Workshop Bunker (44, 65, -127)!');
    // Step forward into bunker
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    await clearFireAhead();
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  portalActive: !!portal
};
