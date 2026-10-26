// programs/499-sprint-tunnel-to-spawner-front.js
console.log('=== Program 499: Sprint Covered Tunnel to Spawner Front (44, 65, -171) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('team: Alpha sprinting through 100% covered tunnel to join Beta, Gamma, and Delta at Blaze Spawner front (44, 65, -171)!');

async function pickupNearby() {
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
  if (items.length > 0) {
    try { await lib.pickup(8); } catch (e) {}
  }
}

const tunnelWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 65, -20),
  new Vec3(63, 65, -35),
  new Vec3(62, 65, -50),
  new Vec3(61, 65, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -140),
  new Vec3(44, 65, -150),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -171)
];

for (const wp of tunnelWaypoints) {
  if (isCancelled()) break;
  if (bot.entity.position.z < wp.z - 3) continue;

  console.log(`Advancing to ${lib.fmt(wp)}...`);
  await pickupNearby();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {
    try {
      await bot.lookAt(new Vec3(wp.x, 64.0, wp.z), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

await pickupNearby();
await lib.equipWeapon();
await lib.equipArmor();

console.log('Alpha reached spawner front:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);

bot.chat(`team: Alpha united with team at Blaze Spawner front ${lib.fmt(bot.entity.position)}! Dist: ${dist.toFixed(1)}m, Blaze Rods: ${lib.count('blaze_rod')}. Ready to farm Blaze Rods!`);
