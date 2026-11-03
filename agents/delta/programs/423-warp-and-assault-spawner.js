// programs/423-warp-and-assault-spawner.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Enter portal and stand completely still to warp
if (bot.game.dimension === 'overworld') {
  console.log('Stepping into portal center (299.5, 73.0, -54.0)...');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const portalCenter = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);

  console.log('Standing still inside portal to let warp trigger...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(500);
    if (bot.game.dimension === 'the_nether') break;
    // If drifted out of portal, nudge back
    const cur = bot.entity.position;
    if (cur.distanceTo(portalCenter) > 0.8) {
      await bot.lookAt(portalCenter, true);
      bot.setControlState('forward', true);
      await sleep(300);
      bot.setControlState('forward', false);
    }
  }
}

console.log('Dimension after warp wait:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: In the Nether! Marching to Spawner Pillbox (36, 66, -187)...');
  
  // Step forward out of nether portal bunker
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);

  // March waypoints to pillbox
  console.log('Marching to Spawner Pillbox...');
  const marchRes = await marchToSpawnerPillbox();
  console.log('March completed:', JSON.stringify(marchRes));

  // Farm Blazes at pillbox
  bot.chat('delta: In Spawner Pillbox! Farming Blaze Rods alongside team.');
  console.log('Farming Blazes at Pillbox...');
  const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm completed:', JSON.stringify(farmRes));

  const totalRods = lib.count('blaze_rod');
  console.log(`Current Blaze Rods: ${totalRods}`);
  bot.chat(`delta: Harvest status: ${totalRods}/8 Blaze Rods, HP: ${bot.health.toFixed(1)}`);

  if (totalRods >= 8) {
    bot.chat('delta: Milestone 8 achieved (8+ Blaze Rods)! Retreating to Base Camp.');
    const retRes = await retreatToOverworldBase();
    console.log('Retreat completed:', JSON.stringify(retRes));
  }
}
