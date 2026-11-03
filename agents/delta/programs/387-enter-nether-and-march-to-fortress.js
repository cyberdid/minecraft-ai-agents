// programs/387-enter-nether-and-march-to-fortress.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Walk into Nether portal at (298.5, 73.0, -54.0)
console.log('Stepping into Nether portal at (298.5, 73.0, -54.0)...');
try {
  await lib.goTo(298, 73, -54, 0.5, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(298.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 2. Await dimension change to 'the_nether'
console.log('Awaiting Nether dimension transition...');
const portalWaitStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalWaitStart < 20000) {
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Dimension transit not completed within 20s.');
  return;
}

bot.chat('delta: Armed with stone_sword! Advancing through Nether to Spawner Pillbox!');

// 3. Extinguish any nearby fire / soul_fire around Nether bunker
async function extinguishNearbyFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  if (fireIds.length === 0) return;
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 8, count: 10 });
  for (const fPos of fires) {
    const b = bot.blockAt(fPos);
    if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
      console.log(`Extinguishing ${b.name} at ${lib.fmt(fPos)}...`);
      try { await bot.dig(b); } catch (e) {}
    }
  }
}

await extinguishNearbyFire();

// 4. Safe exit bunker towards x=46, z=-7
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 5. Follow the verified safe waypoints to Fortress Workshop Outpost (44, 65, -127)
const waypoints = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),   // Tunnel entrance
  new Vec3(63, 65, -20),  // Inside tunnel
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174), // Spawner Bridgehead
  new Vec3(37, 65, -177), // Cross-bridge under roof
  new Vec3(36, 67, -185)  // Spawner Balcony Pillbox
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  await extinguishNearbyFire();
  
  console.log(`Waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)} (current: ${lib.fmt(bot.entity.position)}, HP: ${bot.health})`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
  } catch (err) {
    console.log(`WP ${i + 1} goTo note: ${err.message}`);
    // If goTo failed, carefully step towards WP without falling
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at Spawner Pillbox! Pos:', lib.fmt(bot.entity.position));

// 6. Check for dropped items at pillbox (rods, armor, tools)
try {
  const p = await lib.pickup(5);
  if (p > 0) console.log(`Picked up ${p} drops at pillbox!`);
} catch (e) {}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log(`Current state: HP: ${bot.health}, blaze_rods: ${lib.count('blaze_rod')}`);
