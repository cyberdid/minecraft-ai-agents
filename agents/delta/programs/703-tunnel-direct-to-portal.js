console.log('=== PROGRAM 703: DIRECT TUNNEL TO PORTAL 1 (46.5, 66, 2) ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const portalTarget = new Vec3(46.5, 66.0, 2.0);
console.log(`Targeting Portal at ${lib.fmt(portalTarget)} (distance: ${bot.entity.position.distanceTo(portalTarget).toFixed(1)}m)...`);

// Direct dig-and-step loop
const start = Date.now();
while (bot.entity.position.distanceTo(portalTarget) > 1.2 && Date.now() - start < 35000 && !isCancelled()) {
  const curPos = bot.entity.position;
  await bot.lookAt(portalTarget, true);

  const dx = portalTarget.x - curPos.x;
  const dz = portalTarget.z - curPos.z;
  const dist = Math.hypot(dx, dz);

  if (dist < 1.0) break;

  const nx = dx / dist;
  const nz = dz / dist;

  // Check 1 block ahead
  const aheadFeet = curPos.offset(nx * 0.9, 0, nz * 0.9);
  const aheadHead = curPos.offset(nx * 0.9, 1, nz * 0.9);

  for (const p of [aheadFeet, aheadHead]) {
    const b = bot.blockAt(p);
    if (b && b.boundingBox === 'block' && !globalThis.isProtectedBlock(b)) {
      console.log(`Digging block at ${lib.fmt(p)}: ${b.name}`);
      try {
        await bot.dig(b, true);
      } catch (e) {}
    }
  }

  // Clear fire ahead
  await globalThis.clearFireAhead();

  // Move forward
  bot.setControlState('forward', true);
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
  }
  await sleep(200);
  bot.setControlState('forward', false);
}

console.log('Arrived near portal! Current pos:', lib.fmt(bot.entity.position));

// Search nearest portal block and step inside
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
if (portalBlock) {
  console.log(`Entering portal block at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

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

  console.log('Inside Base House! Final pos:', lib.fmt(bot.entity.position));
  bot.chat(`delta: Secure in Overworld Base House! HP: ${bot.health}/20, Food: ${bot.food}/20. Ready for Stronghold expedition!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
