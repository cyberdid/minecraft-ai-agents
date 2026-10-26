// programs/554-advance-ridge-to-fortress.js
console.log('=== Program 554: Advance Along Safe East Ridge to Fortress Bunker ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

// Safe ridge waypoints strictly keeping x >= 61 until z <= -100
const ridgeWaypoints = [
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127)
];

// Helper to pick up nearby drops
async function pickupDrops() {
  const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 6);
  if (drops.length > 0) {
    try { await lib.pickup(6); } catch (e) {}
  }
}

for (let i = 0; i < ridgeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = ridgeWaypoints[i];
  const dist = bot.entity.position.distanceTo(wp);
  if (dist < 2.5) {
    console.log(`Already at WP ${i + 1} (${lib.fmt(wp)})`);
    continue;
  }
  
  console.log(`Navigating to WP ${i + 1}/${ridgeWaypoints.length}: ${lib.fmt(wp)} (dist: ${dist.toFixed(1)}m)...`);
  
  // Look down at y=64 to avoid Enderman stare
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 12000 });
  } catch (err) {
    console.log(`lib.goTo to WP ${i + 1} failed: ${err.message}. Trying direct walk...`);
    // Direct controls fallback: face WP, sprint/jump forward
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
  
  await pickupDrops();
  console.log(`Current position after WP ${i + 1}: ${lib.fmt(bot.entity.position)}`);
}

console.log('=== March Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`alpha: Reached ${lib.fmt(bot.entity.position)} along East Ridge trail! Advancing to Fortress frontline!`);
