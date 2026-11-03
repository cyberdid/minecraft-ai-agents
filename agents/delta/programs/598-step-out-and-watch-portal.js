console.log('=== STEP OUT TO PORTAL & WATCH SILL ===');

// Step through base door to portal exterior
if (bot.entity.position.z < -54.0) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door passage:', e.message);
  }
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 0.8));
} catch (e) {}

console.log('Standing near portal at:', lib.fmt(bot.entity.position));
bot.chat('delta: At portal frame (299, 73, -52) holding flint & steel. Ready to ignite the moment lava is quenched into obsidian!');

// Check animals nearby for quick food if needed
const animals = Object.values(bot.entities).filter(e => e.type === 'mob' && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 15);
console.log('Nearby animals (<15m):', animals.map(a => `${a.name}@${lib.fmt(a.position)}`));

const sillPos = new Vec3(299, 72, -54);
const portalPos = new Vec3(299, 73, -54);
const start = Date.now();
let portal = null;

while (!isCancelled() && Date.now() - start < 45000) {
  portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portal) {
    console.log('PORTAL ACTIVE!');
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sill2 = bot.blockAt(new Vec3(300, 72, -54));

  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
  const pStr = players.map(p => `${p.username}@${lib.fmt(p.position)} (held: ${p.heldItem?.name || 'none'})`).join(', ');

  console.log(`[${Math.round((Date.now() - start)/1000)}s] Sill: ${sill?.name} | Players: ${pStr}`);

  // If lava block appeared in mold at (299, 72, -54)
  if (sill && sill.name === 'lava') {
    console.log('Lava block detected at (299, 72, -54)! Waiting for water quench...');
  }

  // If obsidian appeared at (299, 72, -54)
  if (sill && sill.name === 'obsidian' && sill2 && sill2.name === 'obsidian') {
    console.log('Obsidian is complete at (299, 72, -54)! Igniting portal with flint_and_steel...');
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

  await sleep(1500);
}

if (portal) {
  console.log('Stepping into portal block (299, 73, -54)...');
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
