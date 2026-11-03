// programs/349-find-portal-and-enter.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Find active nether_portal blocks
const portals = lib.find('nether_portal', { maxDistance: 32, count: 10 });
console.log(`Found ${portals.length} nether_portal blocks:`);
for (const p of portals) {
  console.log(`  nether_portal at ${lib.fmt(p.position)}`);
}

if (portals.length > 0) {
  const p0 = portals[0].position;
  console.log(`Moving directly into nether_portal at ${lib.fmt(p0)}...`);
  // Stand directly inside portal block
  bot.pathfinder.stop();
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p0.x, p0.y, p0.z));
  } catch (e) {
    console.log('Pathfinder note:', e.message);
  }
  
  // Walk into the exact center of the portal block
  await bot.lookAt(p0.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
} else {
  console.log('No nether_portal blocks found within 32m! Checking (298, 72, -54)...');
  const b = bot.blockAt(new Vec3(298, 72, -54));
  console.log(`Block at (298, 72, -54): ${b?.name}`);
}

console.log('Waiting for Nether transit (staying inside portal)...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (String(bot.game.dimension).includes('nether')) {
  bot.chat(`delta: Successfully entered Nether! Pos: ${lib.fmt(bot.entity.position)} with shield & sword!`);
}
