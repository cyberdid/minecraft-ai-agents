// programs/316-scan-and-fortify-crossbridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);

// 1. Scan high walkway from z=-167 to z=-176 along x=44
console.log('Scanning x=44 walkway:');
for (let z = -167; z >= -176; z--) {
  const bFloor = bot.blockAt(new Vec3(44, 64, z));
  const bAt = bot.blockAt(new Vec3(44, 65, z));
  const bWest = bot.blockAt(new Vec3(43, 65, z));
  const bWestHigh = bot.blockAt(new Vec3(43, 66, z));
  console.log(`z=${z}: floor=${bFloor?.name || 'AIR'}, westWall=[${bWest?.name || 'OPEN'}, ${bWestHigh?.name || 'OPEN'}]`);
}

// 2. Scan cross-bridge at z=-176 from x=44 to x=37
console.log('Scanning cross-bridge at z=-176:');
for (let x = 44; x >= 37; x--) {
  const bFloor = bot.blockAt(new Vec3(x, 64, -176));
  const bAt = bot.blockAt(new Vec3(x, 65, -176));
  const bNorth = bot.blockAt(new Vec3(x, 65, -177));
  const bNorthHigh = bot.blockAt(new Vec3(x, 66, -177));
  console.log(`x=${x}, z=-176: floor=${bFloor?.name || 'AIR'}, northCover=[${bNorth?.name || 'OPEN'}, ${bNorthHigh?.name || 'OPEN'}]`);
}

// 3. Check mobs within 30m
const hostiles = Object.values(bot.entities).filter(e => e && e !== bot.entity && (e.name === 'blaze' || e.name === 'wither_skeleton' || e.name === 'ghast' || e.type === 'hostile'));
console.log(`Hostiles within 30m: ${hostiles.length}`);
for (const h of hostiles) {
  const dist = bot.entity.position.distanceTo(h.position);
  if (dist < 30) {
    console.log(`  Hostile ${h.name} at ${lib.fmt(h.position)} (dist: ${dist.toFixed(1)}m)`);
  }
}

// 4. Safely advance to (44, 65, -175) behind the West wall
console.log('Moving safely behind West wall to (44, 65, -175)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44, 65, -175, 0.5));
} catch (e) {
  console.log('Move note:', e.message);
  await bot.lookAt(new Vec3(44, 66, -175), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
}

console.log('Current pos after advance:', lib.fmt(bot.entity.position));
