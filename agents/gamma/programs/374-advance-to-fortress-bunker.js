// programs/374-advance-to-fortress-bunker.js
console.log('=== ADVANCE TO FORTRESS WORKSHOP BUNKER ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Ensure shield is in offhand
if (bot.inventory.slots[45]?.name !== 'shield') {
  try {
    const shieldItem = bot.inventory.items().find(i => i.name === 'shield');
    if (shieldItem) await bot.equip(shieldItem, 'off-hand');
  } catch (e) {}
}
await lib.equipWeapon();

// Configure strict fire avoidance
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

// Waypoints along safe East Ridge to Fortress Workshop Bunker
const ridgeWaypoints = [
  { name: 'Ridge Mid-Caution (z=-42)', pos: new Vec3(62.5, 66.0, -42.0) },
  { name: 'Ridge Mid', pos: new Vec3(62.0, 65.0, -55.0) },
  { name: 'Ridge North-Caution (z=-70)', pos: new Vec3(62.0, 66.0, -70.0) },
  { name: 'Ridge North', pos: new Vec3(62.0, 66.0, -80.0) },
  { name: 'Ridge North Bend', pos: new Vec3(61.0, 66.0, -100.0) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65.0, -115.0) },
  { name: 'Fortress Workshop Bunker Entrance', pos: new Vec3(44.0, 65.0, -127.0) }
];

for (let i = 0; i < ridgeWaypoints.length && !isCancelled(); i++) {
  const wp = ridgeWaypoints[i];
  console.log(`[WP ${i + 1}/${ridgeWaypoints.length}] ${wp.name} at ${lib.fmt(wp.pos)}...`);
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

  if (bot.health <= 4) {
    console.log('CRITICAL HP (', bot.health, ') - building emergency cobblestone shelter!');
    try {
      await lib.place('cobblestone', bot.entity.position.x, bot.entity.position.y + 2, bot.entity.position.z);
    } catch (e3) {}
    break;
  }
}

console.log('Arrived at Fortress Bunker entrance! Pos:', lib.fmt(bot.entity.position));

// Step inside bunker at (44, 65, -129)
try {
  await lib.goTo(44, 65, -129, 1, { timeoutMs: 5000 });
  console.log('Safely inside Fortress Workshop Bunker!');
  bot.chat('gamma: safely inside Fortress Workshop Bunker at (44, 65, -129)!');
} catch (e) {
  console.log('Bunker step note:', e.message);
}

console.log('Ending status:', JSON.stringify(lib.status()));
