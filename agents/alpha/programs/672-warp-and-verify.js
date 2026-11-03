// programs/672-warp-and-verify.js
console.log('=== Program 672: Warp & Verify Nether Entry ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

globalThis.enterNetherPortal = async function(timeoutMs = 25000) {
  if (bot.game.dimension === 'the_nether') return { dimension: 'the_nether', pos: bot.entity.position };

  if (bot.entity.position.z < -54.2) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 8000 }); } catch (e2) {}
  }

  const target = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(target) > 0.8) {
    await bot.lookAt(target, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  bot.pathfinder.stop();
  bot.clearControlStates();

  const start = Date.now();
  console.log('Waiting in portal for dimension shift...');
  while (bot.game.dimension !== 'the_nether' && Date.now() - start < timeoutMs && !checkCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
  bot.clearControlStates();
  if (bot.game.dimension === 'the_nether') {
    await sleep(400);
    if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
      await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position };
};

const res = await globalThis.enterNetherPortal(30000);
console.log('Portal warp result:', res);
console.log('Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
