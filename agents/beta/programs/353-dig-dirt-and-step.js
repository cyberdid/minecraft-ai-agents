// programs/353-dig-dirt-and-step.js
console.log('=== Dig dirt blocks at (303, 23..25, -44) ===');

for (let y = 23; y <= 26; y++) {
  const b = bot.blockAt(new Vec3(303, y, -44));
  if (b && b.name !== 'air' && b.name !== 'cave_air') {
    console.log(`Digging block at (303, ${y}, -44): ${b.name}...`);
    await bot.dig(b);
    await sleep(200);
  }
}

// Pickup drops
await lib.pickup(4);
console.log('Beta inventory:', JSON.stringify(lib.inv()));

// Test path again
const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = true;
const path = bot.pathfinder.getPathTo(m, new goals.GoalNear(303, 33, -43, 1), 3000);
console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
if (path.path && path.path.length > 0) {
  for (let i = 0; i < Math.min(path.path.length, 5); i++) {
    const n = path.path[i];
    console.log(`  node ${i}: (${n.x}, ${n.y}, ${n.z})`);
  }
}
