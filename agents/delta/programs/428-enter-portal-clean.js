// programs/428-enter-portal-clean.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Step 1: Walk to front of opening at (299.5, 72.0, -52.0)
const approach = new Vec3(299.5, 72.0, -52.0);
console.log('Walking to approach:', lib.fmt(approach));
await bot.lookAt(approach.offset(0, 1.6, 0), true);
bot.setControlState('forward', true);
const t0 = Date.now();
while (bot.entity.position.distanceTo(approach) > 0.6 && Date.now() - t0 < 4000 && !isCancelled()) {
  await sleep(100);
}
bot.setControlState('forward', false);
console.log('At approach pos:', lib.fmt(bot.entity.position));

// Step 2: Step into portal center at (299.5, 73.0, -54.0)
const portalCenter = new Vec3(299.5, 73.0, -54.0);
console.log('Stepping into portal center:', lib.fmt(portalCenter));
await bot.lookAt(portalCenter.offset(0, 1.0, 0), true);
bot.setControlState('forward', true);
if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal? Pos:', lib.fmt(bot.entity.position), 'block at feet:', bot.blockAt(bot.entity.position)?.name);

// Step 3: Stand completely still and wait for warp
bot.clearControlStates();
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000 && !isCancelled()) {
  await sleep(500);
}

console.log('Dimension after warp wait:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
