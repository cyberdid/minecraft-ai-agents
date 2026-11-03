// programs/420-get-out-of-water.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(200);

console.log('Bot pos:', lib.fmt(bot.entity.position));

// Check water status
const curBlock = bot.blockAt(bot.entity.position);
console.log('Current block:', curBlock?.name);

// Find nearest solid block with air above it toward +x (toward portal at 299)
const solidBlocks = bot.findBlocks({
  matching: (b) => b && b.boundingBox === 'block',
  maxDistance: 16,
  count: 30
}).filter(p => {
  const up = bot.blockAt(p.offset(0, 1, 0));
  const up2 = bot.blockAt(p.offset(0, 2, 0));
  return up && up.name === 'air' && up2 && up2.name === 'air';
}).sort((a, b) => {
  // sort by distance to portal (299, 72, -54)
  const target = new Vec3(299, 72, -54);
  return a.distanceTo(target) - b.distanceTo(target);
});

console.log(`Found ${solidBlocks.length} solid landing blocks.`);
if (solidBlocks.length > 0) {
  const best = solidBlocks[0];
  console.log('Best landing block:', lib.fmt(best), 'standing at y+1:', best.y + 1);
  await bot.lookAt(best.offset(0.5, 1.5, 0.5), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  bot.setControlState('sprint', true);
  const start = Date.now();
  while (Date.now() - start < 8000 && !isCancelled()) {
    if (bot.entity.position.distanceTo(best.offset(0.5, 1, 0.5)) < 1.5) break;
    await sleep(200);
  }
  bot.setControlState('forward', false);
  bot.setControlState('jump', false);
  bot.setControlState('sprint', false);
}

console.log('Now at:', lib.fmt(bot.entity.position), 'block:', bot.blockAt(bot.entity.position)?.name);
