// programs/468-advance-east-ridge-to-fortress.js
console.log('=== Program 468: Advance East Ridge to Fortress & Mountain ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Helper to clear fire around bot
async function clearFire() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 6,
    count: 6
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b);
    } catch (e) {}
  }
}

// 1. Pick up dropped items at (66, 67, -2)
console.log('Moving to items at (66, 67, -2)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(66, 67, -2, 2));
  await lib.pickup(6);
} catch (e) {
  console.log('Item pickup note:', e.message);
}
console.log('Inventory after pickup:', JSON.stringify(lib.inv()));

// 2. Verified Safe Waypoints strictly along x >= 61 until z = -100
const safeWaypoints = [
  { x: 63, y: 64, z: -5 },
  { x: 62, y: 66, z: -30 },
  { x: 61, y: 67, z: -60 },
  { x: 62, y: 67, z: -80 },   // CRITICAL: stay at x=62 to bypass fire pit at x=55
  { x: 61, y: 66, z: -100 },  // CRITICAL: stay at x=61 until past z=-100
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -128 }   // Fortress Workshop Outpost entrance
];

for (const wp of safeWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to waypoint (${wp.x}, ${wp.y}, ${wp.z})...`);
  await clearFire();
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 16000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z); } catch (e2) {
      console.log(`Failed waypoint (${wp.x}, ${wp.z}):`, e2.message);
    }
  }
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
}

// 3. Advance through covered hallway to z=-147
if (bot.entity.position.z < -120) {
  console.log('Entering covered advance tunnel towards z=-147...');
  try {
    await lib.goTo(44, 65, -147, 1, { timeoutMs: 16000 });
  } catch (e) {
    try { await lib.goToXZ(44, -147); } catch (e2) {}
  }
}

// 4. Inspect mountain breach point at (44, 65, -148..-150)
console.log('Alpha arrived at:', lib.fmt(bot.entity.position));
const floor149 = bot.blockAt(new Vec3(44, 64, -149));
const wall149 = bot.blockAt(new Vec3(44, 65, -149));
console.log(`Block at (44, 64, -149): ${floor149?.name || 'unknown'}`);
console.log(`Block at (44, 65, -149): ${wall149?.name || 'unknown'}`);

// Report nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat(`team: Alpha arrived at Fortress tunnel breach ${lib.fmt(bot.entity.position)}! HP: ${bot.health}, Food: ${bot.food}. Ready to tunnel to Blaze Spawner at (32, 68, -190)!`);

console.log('Alpha status:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
