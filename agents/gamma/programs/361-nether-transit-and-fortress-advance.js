// programs/361-nether-transit-and-fortress-advance.js
console.log('=== NETHER TRANSIT & EXPEDITION ADVANCE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobblestone:', lib.count('cobblestone'));

// Equip best sword
await lib.equipWeapon();

// 1. If currently in overworld, enter nether portal
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Finding Nether portal blocks near base...');
  try {
    await lib.goTo(298, 72, -53, 2, { dig: true, timeoutMs: 12000 });
  } catch (e) {}

  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 5
  });

  if (portals.length === 0) {
    throw new Error('No active nether_portal found near (298, 72, -54)!');
  }

  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);
  bot.setControlState('jump', true);
  try {
    await lib.goTo(p.x + 0.5, p.y, p.z + 0.5, 0.5, { dig: false, timeoutMs: 8000 });
  } catch (e) {}
  bot.clearControlStates();

  console.log('Waiting for dimension switch...');
  const t0 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 18000)) {
    await sleep(500);
  }
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Failed to transit into the Nether dimension!');
}

console.log('Successfully in the Nether! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: arrived in Nether with 38 cobble & stone swords! Marching to Fortress!');

// Step south out of Nether portal frame to prevent portal lock
console.log('Stepping out of portal to (40.5, 65, -8.5)...');
try {
  await lib.walkTo(40.5, -8.5, 2000);
} catch (e) {}
bot.clearControlStates();

// Configure safe movement
if (typeof configureFireAvoidance === 'function') {
  configureFireAvoidance();
}

async function extinguishNearbyHazards() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 6,
    count: 8
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
        await bot.dig(b);
      }
    } catch (e) {}
  }
}

await extinguishNearbyHazards();

// Validated Nether march waypoints
const waypoints = [
  { name: 'Valley 1', pos: new Vec3(48.0, 65.0, -8.0) },
  { name: 'Valley 2', pos: new Vec3(56.0, 65.0, -8.0) },
  { name: 'East Ridge Entry', pos: new Vec3(63.0, 65.0, -8.0) },
  { name: 'Ridge South', pos: new Vec3(63.0, 65.0, -15.0) },
  { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66.0, -30.0) },
  { name: 'Ridge Mid-Caution (z=-42)', pos: new Vec3(62.5, 66.0, -42.0) },
  { name: 'Ridge Mid', pos: new Vec3(62.0, 65.0, -55.0) },
  { name: 'Ridge North-Caution (z=-70)', pos: new Vec3(62.0, 66.0, -70.0) },
  { name: 'Ridge North', pos: new Vec3(62.0, 66.0, -80.0) },
  { name: 'Ridge North Bend', pos: new Vec3(61.0, 66.0, -100.0) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65.0, -115.0) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65.0, -127.0) },
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65.0, -145.0) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65.0, -160.0) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65.0, -169.0) },
  { name: 'Spawner Balcony Deck', pos: new Vec3(34.0, 67.0, -187.0) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] ${wp.name} at ${lib.fmt(wp.pos)}...`);
  await extinguishNearbyHazards();

  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Navigation note to ${wp.name}:`, e2.message);
    }
  }

  await extinguishNearbyHazards();
  try { await lib.pickup(4); } catch (e) {}

  if (bot.health <= 8) {
    console.log('CRITICAL: Health dropped to', bot.health, '- holding position behind cover!');
    break;
  }
}

console.log('Arrived at final waypoint! Pos:', lib.fmt(bot.entity.position));
console.log('Blaze rods in inv:', lib.count('blaze_rod'));
console.log('Final status:', JSON.stringify(lib.status()));
