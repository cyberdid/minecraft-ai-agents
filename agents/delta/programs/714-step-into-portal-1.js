console.log('=== PROGRAM 714: STEP INTO PORTAL 1 (46.5, 66, 2) ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const portalTarget = new Vec3(46.5, 66.0, 2.0);
console.log(`Heading directly to Portal 1 at ${lib.fmt(portalTarget)}...`);

// Walk North along x=47 to z=2
await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
const walkStart = Date.now();
while (bot.entity.position.distanceTo(portalTarget) > 0.8 && Date.now() - walkStart < 8000 && !isCancelled()) {
  await bot.lookAt(portalTarget, true);
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
  }
  await sleep(100);
}
bot.setControlState('forward', false);

console.log('Arrived at portal target! Pos:', lib.fmt(bot.entity.position));

// Stand inside portal block
const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 4 });
if (pb) {
  console.log(`Standing inside nether_portal block at ${lib.fmt(pb.position)}...`);
  await bot.lookAt(pb.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Current dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// In Overworld: enter Base House at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into Base House (293, 72, -55)...');
  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      await lib.goToXZ(294, -53, { timeoutMs: 12000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }

  // Inside base
  console.log('Inside Base House! Final pos:', lib.fmt(bot.entity.position));

  // Sleep if night
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t <= 23460) {
    const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
    if (bed) {
      try {
        await bot.sleep(bed);
        bot.chat('delta: Sleeping in bed to skip night!');
        await sleep(5500);
      } catch (e) {}
    }
  }

  // Check Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const items = chest.containerItems();
      console.log('Base Chest items:');
      for (const it of items) {
        console.log(`  ${it.name} x${it.count}`);
      }
      chest.close();
    } catch (e) {}
  }

  bot.chat('delta: Secure inside Base House! Ready with team for Milestone 10 Stronghold expedition to (233, y, -98)!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
