// programs/467-inspect-ridge-terrain.js
console.log('=== INSPECT RIDGE TERRAIN (GAMMA) ===');
console.log('Current Gamma pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const cur = bot.entity.position;
// Inspect blocks ahead from z = -45 to z = -60
for (let z = -45; z >= -60; z--) {
  for (let x = 60; x <= 63; x++) {
    for (let y = 64; y <= 69; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        // print ground blocks (top surface)
        const above = bot.blockAt(new Vec3(x, y + 1, z));
        if (above && above.name === 'air') {
          console.log(`Surface at (${x}, ${y}, ${z}): ${b.name}`);
        }
      }
    }
  }
}

// Test pathfinding from current pos to (61.5, 67, -55)
const target = new Vec3(61.5, 67, -55);
const moves = new Movements(bot, mcData);
const path = bot.pathfinder.getPathTo(moves, new goals.GoalNear(target.x, target.y, target.z, 2), 3000);
console.log('Path to (61.5, 67, -55): status =', path.status, 'nodes =', path.path ? path.path.length : 0);
if (path.status !== 'success') {
  // Test GoalNearXZ
  const pathXZ = bot.pathfinder.getPathTo(moves, new goals.GoalNearXZ(target.x, target.z, 2), 3000);
  console.log('PathXZ to target: status =', pathXZ.status, 'nodes =', pathXZ.path ? pathXZ.path.length : 0);
}
