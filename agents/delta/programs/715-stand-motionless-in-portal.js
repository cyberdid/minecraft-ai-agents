console.log('=== PROGRAM 715: STAND MOTIONLESS IN PORTAL 1 ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const portalCenter = new Vec3(46.5, 66.0, 2.0);
console.log(`Stepping back into Portal 1 center at ${lib.fmt(portalCenter)}...`);

// Step into portal center
await bot.lookAt(portalCenter, true);
bot.setControlState('forward', true);
const enterStart = Date.now();
while (bot.entity.position.distanceTo(portalCenter) > 0.6 && Date.now() - enterStart < 4000) {
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(150);
    bot.setControlState('jump', false);
  }
  await sleep(50);
}
bot.clearControlStates();

console.log('Inside Portal! Current pos:', lib.fmt(bot.entity.position));
console.log('Standing completely motionless for portal warp timer (4.0s in survival)...');

const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  // Keep centered inside portal frame
  if (Math.hypot(cur.x - 46.5, cur.z - 2.0) > 0.6) {
    await bot.lookAt(portalCenter, true);
    bot.setControlState('forward', true);
    await sleep(150);
    bot.clearControlStates();
  }
  await sleep(200);
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  console.log('WARPED TO OVERWORLD! Current pos:', lib.fmt(bot.entity.position));
  bot.chat('delta: Arrived in Overworld! Entering Base House (293, 72, -55)...');

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

  bot.chat('delta: United with team in Base House! Ready for Milestone 10 Stronghold expedition to (233, y, -98)!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
