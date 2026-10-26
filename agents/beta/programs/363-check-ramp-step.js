// programs/363-check-ramp-step.js
console.log('=== Check blocks at (308, y, -41) ===');
const p = bot.entity.position;
console.log('Beta exact pos:', p);

for (let y = 30; y <= 33; y++) {
  const b = bot.blockAt(new Vec3(308, y, -41));
  console.log(`Block at (308, ${y}, -41): ${b ? b.name : 'null'} (bb: ${b?.boundingBox})`);
}

const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = true;
const path = bot.pathfinder.getPathTo(m, new goals.GoalNear(310, 35, -41, 1), 3000);
console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
