// programs/657-inspect-ridge-and-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 657: INSPECT SURROUNDINGS & PORTAL ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan for any nether_portal block within 32m
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 32, count: 10 });
console.log(`Portals found within 32m: ${portals.length}`);
for (const p of portals) {
  console.log(`  Portal at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}

// 2. Scan players nearby (Delta!)
for (const p of Object.values(bot.players)) {
  if (p.entity && p.username !== bot.username) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// 3. Inspect blocks between current position (63.5, 65, -8.3) and (54, 65, -7)
console.log('Inspecting path towards (54, 65, -7)...');
for (let x = 63; x >= 54; x--) {
  const floor = bot.blockAt(new Vec3(x, 64, -8));
  const feet = bot.blockAt(new Vec3(x, 65, -8));
  const head = bot.blockAt(new Vec3(x, 66, -8));
  console.log(`  x=${x}: floor=${floor ? floor.name : 'null'}, feet=${feet ? feet.name : 'null'}, head=${head ? head.name : 'null'}`);
}

// 4. If feet or head blocks are solid, dig through!
const moves = new Movements(bot, mcData);
moves.canDig = true; // Allow digging out soul sand obstruction!
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// If portal found, pathfind directly to it (with canDig = true)
if (portals.length > 0) {
  const targetPortal = portals[0];
  console.log(`Pathfinding to portal at ${lib.fmt(targetPortal)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(targetPortal.x, targetPortal.y, targetPortal.z, 0.8));
    console.log('Stepping into portal...');
    await bot.lookAt(targetPortal.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
    bot.setControlState('forward', false);

    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } catch (e) {
    console.log('Portal goto error:', e.message);
  }
} else {
  console.log('No portal block found within 32m! Moving to (54, 65, -8) with canDig=true...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(54.0, 65.0, -8.0, 1.0));
    console.log('Arrived at x=54! Scanning portals again...');
    const p2 = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 24, count: 5 });
    console.log(`Portals from x=54: ${p2.length}`);
  } catch (e2) {
    console.log('Goto x=54 error:', e2.message);
  }
}

console.log(`=== END PROGRAM 657: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food
};
