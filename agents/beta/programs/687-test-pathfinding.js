// programs/687-test-pathfinding.js
console.log('=== Program 687: Test Pathfinding from Nether Bunker ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// Check blocks surrounding the bot at Nether portal
console.log('Blocks around bunker:');
for (let dx = -3; dx <= 3; dx++) {
  for (let dz = -3; dz <= 3; dz++) {
    const p = bot.entity.position.floored().offset(dx, 0, dz);
    const b = bot.blockAt(p);
    if (b && b.name !== 'air' && b.name !== 'nether_portal') {
      console.log(`Block at (${p.x}, ${p.y}, ${p.z}): ${b.name}`);
    }
  }
}

// Try going to WP 0
const wp0 = NETHER_PILLBOX_WAYPOINTS[0];
console.log('Testing path to WP0:', JSON.stringify(wp0));
try {
  await lib.goTo(wp0.x, wp0.y, wp0.z, 1.5, { dig: false, timeoutMs: 5000 });
  console.log('Success going to WP0! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('lib.goTo error:', e.name, e.message, e.stack);
}
