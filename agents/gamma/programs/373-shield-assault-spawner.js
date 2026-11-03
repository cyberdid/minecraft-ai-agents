// programs/373-shield-assault-spawner.js
console.log('=== SHIELD-PROTECTED ASSAULT ON BLAZE SPAWNER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Offhand:', bot.inventory.slots[45]?.name);

// 1. Enter Nether portal
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
    throw new Error('No active nether_portal found near base!');
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
  throw new Error('Failed to transit into the Nether!');
}

console.log('In Nether! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: in Nether with active SHIELD & stone sword! Advancing to Spawner!');

// Step out of portal frame
try {
  await lib.walkTo(40.5, -8.5, 2000);
} catch (e) {}
bot.clearControlStates();

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

// Waypoints to Spawner Balcony
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
  { name: 'Spawner Balcony Deck', pos: new Vec3(35.0, 66.0, -187.0) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] ${wp.name}...`);
  await extinguishNearbyHazards();

  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {}
  }

  await extinguishNearbyHazards();
  try { await lib.pickup(4); } catch (e) {}

  if (bot.health <= 10) {
    console.log('Health low on march:', bot.health);
    break;
  }
}

console.log('At Spawner Balcony! Pos:', lib.fmt(bot.entity.position));

// Pillbox combat with active shield
await lib.equipWeapon();
if (bot.inventory.slots[45]?.name !== 'shield') {
  try { await lib.equipArmor(); } catch (e) {}
}

const combatDeadline = Date.now() + 45000;
let rodsBefore = lib.count('blaze_rod');

while (Date.now() < combatDeadline && !isCancelled()) {
  if (bot.health <= 8) {
    console.log('Health low (', bot.health, ') - falling back behind blast wall at (44, 65, -169)!');
    bot.deactivateItem();
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 6000 }); } catch (e) {}
    break;
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));

    // Lower shield momentarily to attack
    bot.deactivateItem();
    bot.attack(target);
    await sleep(400);

    // Raise shield to block incoming fireballs!
    bot.activateItem();
    await sleep(350);

    await lib.pickup(5);
  } else {
    // Keep shield raised while waiting
    bot.activateItem();
    await lib.pickup(5);
    await sleep(600);
  }

  const rodsNow = lib.count('blaze_rod');
  if (rodsNow > rodsBefore) {
    console.log(`*** BLAZE ROD HARVESTED! TOTAL: ${rodsNow} ***`);
    bot.chat(`gamma: harvested Blaze Rod! Total: ${rodsNow}`);
    rodsBefore = rodsNow;
  }
}

bot.deactivateItem();
console.log('Combat round complete. Blaze rods in inv:', lib.count('blaze_rod'), 'HP:', bot.health);
console.log('Ending status:', JSON.stringify(lib.status()));
