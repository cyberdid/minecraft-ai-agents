console.log('=== DELTA: STEP ONTO SILL & WARP TO OVERWORLD ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}`);

// Turn towards (46.5, 66.0, 2.0)
const sillCenter = new Vec3(46.5, 66.0, 2.0);
await bot.lookAt(sillCenter, true);

// Jump and walk onto the sill
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.setControlState('jump', false);

// Fine tune position onto sill
const startMove = Date.now();
while (Date.now() - startMove < 3000) {
  const p = bot.entity.position;
  console.log(`Current pos: ${lib.fmt(p)}`);
  if (Math.abs(p.z - 2.0) < 0.4 && p.y >= 65.8) {
    console.log('Successfully positioned inside nether_portal block on top of sill!');
    break;
  }
  await bot.lookAt(sillCenter, true);
  bot.setControlState('forward', true);
  if (p.y < 65.8) bot.setControlState('jump', true);
  await sleep(250);
  bot.setControlState('jump', false);
}

// Clear all control states and stand completely motionless
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log(`Final motionless position: ${lib.fmt(bot.entity.position)}`);
const insideBlock = bot.blockAt(bot.entity.position);
console.log(`Block intersecting player: ${insideBlock ? insideBlock.name : 'null'}`);

console.log('Waiting for Nether-to-Overworld warp...');
const startWarp = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - startWarp < 20000 && !isCancelled()) {
  await sleep(250);
}

console.log(`Warp result: dimension = ${bot.game.dimension}, pos = ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'overworld') {
  bot.chat('delta: Arrived in Overworld at Nether Portal!');
  // Walk into base
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}

  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
  } catch (e) {}

  console.log(`Inside Base! Pos: ${lib.fmt(bot.entity.position)}`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position
};
