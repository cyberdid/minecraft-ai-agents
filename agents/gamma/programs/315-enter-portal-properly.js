// programs/315-enter-portal-properly.js
console.log('=== INSPECT & ENTER PORTAL ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// Find nether_portal blocks nearby
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 10
});

console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)));

if (portals.length === 0) {
  console.log('No active nether_portal blocks found! Checking frame blocks at (298..299, 72..75, -54):');
  for (let y = 72; y <= 75; y++) {
    for (let x = 297; x <= 300; x++) {
      const p = new Vec3(x, y, -54);
      console.log(`  ${lib.fmt(p)}: ${bot.blockAt(p)?.name}`);
    }
  }
} else {
  const p = portals[0];
  console.log(`Stepping directly into nether_portal block at ${lib.fmt(p)}...`);
  // Target center of portal block
  const targetX = p.x + 0.5;
  const targetY = p.y;
  const targetZ = p.z + 0.5;

  bot.setControlState('jump', true);
  await lib.goTo(targetX, targetY, targetZ, 0.5, { dig: false, timeoutMs: 6000 });
  bot.clearControlStates();

  console.log('Waiting for Nether transit inside portal (pos: ' + lib.fmt(bot.entity.position) + ')...');
  const t0 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
    await sleep(500);
  }
  console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
}
