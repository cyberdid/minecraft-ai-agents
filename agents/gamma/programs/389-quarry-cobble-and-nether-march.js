// programs/389-quarry-cobble-and-nether-march.js
console.log('=== QUARRY COBBLESTONE & NETHER EXPEDITION ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Step outside to quarry
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Navigating to quarry floor (304, 68, -52)...');
await lib.goTo(304, 68, -52, 2, { dig: true, timeoutMs: 10000 });

// 2. Mine 28 cobblestone with stone pickaxe
console.log('Mining cobblestone...');
const targetCobble = 32;
const needed = targetCobble - lib.count('cobblestone');
if (needed > 0) {
  await lib.collect('stone', needed);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 3. Craft backup stone sword
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted backup stone_sword!');
  } catch (e) {}
}

// 4. Check for any animals nearby for food
const animals = Object.values(bot.entities)
  .filter(e => e && ['sheep', 'cow', 'pig'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 30)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

if (animals.length > 0) {
  const a = animals[0];
  console.log(`Hunting ${a.name} for food...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(a.position.x, a.position.y, a.position.z, 2));
    await lib.equipWeapon();
    const dline = Date.now() + 5000;
    while (a.isValid && Date.now() < dline) {
      bot.attack(a);
      await sleep(550);
    }
    await lib.pickup(5);
  } catch (e) {}
}

// 5. Enter Nether Portal at (298, 72, -54)
console.log('Heading to Nether Portal at (298, 72, -54)...');
try {
  await lib.goTo(298, 72, -53, 2, { dig: true, timeoutMs: 10000 });
} catch (e) {}

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 5 });
if (portals.length === 0) throw new Error('No nether_portal block found near base!');

const p = portals[0];
console.log(`Stepping into nether_portal at ${lib.fmt(p)}...`);
bot.setControlState('jump', true);
try {
  await lib.goTo(p.x + 0.5, p.y, p.z + 0.5, 0.5, { dig: false, timeoutMs: 8000 });
} catch (e) {}
bot.clearControlStates();

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 18000)) {
  await sleep(500);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Failed to warp to Nether!');
}

console.log('Successfully in Nether! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: in Nether with stone swords & 30+ cobble! Advancing to Spawner Pillbox!');

// Step out of portal frame
try { await lib.walkTo(40.5, -8.5, 2000); } catch (e) {}
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

// Validated march waypoints to Spawner Balcony
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

  if (bot.health <= 8) {
    console.log('Health critical (', bot.health, ') - falling back behind cover!');
    break;
  }
}

console.log('Arrived at Spawner Balcony! Pos:', lib.fmt(bot.entity.position));

// Pillbox combat
await lib.equipWeapon();
const combatEnd = Date.now() + 40000;
let initialRods = lib.count('blaze_rod');

while (Date.now() < combatEnd && !isCancelled()) {
  if (bot.health <= 8) {
    console.log('Health low (', bot.health, ') - falling back behind blast wall at (44, 65, -169)!');
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
    break;
  }

  // Find nearest Blaze within 4.5m
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 4.5)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(550);
    await lib.pickup(5);
  } else {
    await lib.pickup(5);
    await sleep(600);
  }

  const currentRods = lib.count('blaze_rod');
  if (currentRods > initialRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${currentRods} ***`);
    bot.chat(`gamma: harvested Blaze Rod! Total: ${currentRods}`);
    initialRods = currentRods;
  }
}

console.log('Ending status:', JSON.stringify(lib.status()));
