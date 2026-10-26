// programs/303-check-shaft-path.js
console.log('=== Checking blocks between (315, 48, -32) and (304, 54, -34) ===');
const p = bot.entity.position.floored();

// Walk following the partial path or check where it gets blocked
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = true;
m.allow1by1towers = true;

const path = bot.pathfinder.getPathTo(m, new goals.GoalNear(302, 71, -44, 2), 5000);
console.log('Goal (302, 71, -44) path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
if (path.path) {
  for (let i = 0; i < Math.min(path.path.length, 25); i++) {
    const node = path.path[i];
    console.log(`Node ${i}: (${node.x}, ${node.y}, ${node.z})`);
  }
}

// Let's also check if we can walk manually or pathfind step by step
// Where did Beta come from? Look at surrounding blocks at y=48..52 in range 5
for (let y = 47; y <= 50; y++) {
  for (let x = 310; x <= 316; x++) {
    for (let z = -34; z <= -28; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        console.log(`Air at (${x}, ${y}, ${z})`);
      }
    }
  }
}
