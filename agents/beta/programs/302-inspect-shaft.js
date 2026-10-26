// programs/302-inspect-shaft.js
console.log('=== Inspect path from beta (315, 48, -32) ===');
const p = bot.entity.position.floored();

// Let's find nearby air blocks at y=48, 49, 50, etc.
for (let y = 47; y <= 55; y++) {
  const airBlocks = [];
  for (let dx = -6; dx <= 6; dx++) {
    for (let dz = -6; dz <= 6; dz++) {
      const b = bot.blockAt(new Vec3(p.x + dx, y, p.z + dz));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        airBlocks.push(`(${p.x + dx},${p.z + dz})`);
      }
    }
  }
  console.log(`y=${y}: ${airBlocks.length} air blocks: ${airBlocks.slice(0, 10).join(' ')}${airBlocks.length > 10 ? '...' : ''}`);
}

// Also test Movements configuration: does default Movements allow digging and placing?
const defaultMove = new Movements(bot, mcData);
defaultMove.canDig = true;
defaultMove.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
console.log('Testing pathfinder to (310, 52, -34)...');
try {
  bot.pathfinder.setMovements(defaultMove);
  const path = bot.pathfinder.getPathTo(defaultMove, new goals.GoalNear(304, 54, -34, 2), 5000);
  console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
  if (path.path && path.path.length > 0) {
    console.log('First 5 path nodes:', path.path.slice(0, 5).map(n => `(${n.x},${n.y},${n.z})`).join(' -> '));
  }
} catch (e) {
  console.log('Path test error:', e.message);
}
