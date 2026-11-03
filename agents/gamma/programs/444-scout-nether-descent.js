// programs/444-scout-nether-descent.js
console.log('=== SCOUT NETHER DESCENT ===');
console.log('Gamma at:', lib.fmt(bot.entity.position));

// 1. Check blocks around portal at (43, 75, -14)
for (let dx = -5; dx <= 5; dx++) {
  for (let dz = -5; dz <= 5; dz++) {
    for (let dy = -12; dy <= 2; dy++) {
      const p = new Vec3(43 + dx, 75 + dy, -14 + dz);
      const b = bot.blockAt(p);
      if (b && b.name === 'cobblestone') {
        console.log(`Cobblestone at (${p.x}, ${p.y}, ${p.z})`);
      }
    }
  }
}

// 2. Check blocks down to y=65 at x=40..46, z=-15..-5
console.log('Checking path down to y=65:');
const target = new Vec3(46, 65, -7);
console.log('Target WP 1:', lib.fmt(target));

// Look for safe path
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 2;
bot.pathfinder.setMovements(moves);
const path = bot.pathfinder.getPathTo(moves, new goals.GoalNear(target.x, target.y, target.z, 2), 5000);
console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
if (path.path && path.path.length > 0) {
  console.log('First 5 path nodes:');
  for (let i = 0; i < Math.min(5, path.path.length); i++) {
    console.log(` node ${i}:`, lib.fmt(path.path[i]));
  }
  console.log('Last node:', lib.fmt(path.path[path.path.length - 1]));
}
