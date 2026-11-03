// programs/481-enter-portal-exact.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Find the exact nether_portal blocks
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 6
});

console.log(`Found ${portals.length} portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  // Face portal center and jump into it
  await bot.lookAt(p.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(700);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  bot.clearControlStates();
  console.log('Inside portal at:', lib.fmt(bot.entity.position));

  // Stand completely still for warp
  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - start < 15000) {
    await sleep(300);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: Teleported into the_nether! Marching to mine Nether Gold Ore for Milestone 9.');
  // Step 1m forward out of portal into bunker
  await sleep(400);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
