// programs/316-advance-to-fortress-workshop.js
console.log('=== ADVANCE TO FORTRESS WORKSHOP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Equip stone sword
await lib.equipWeapon();

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    console.log(`Player ${name} visible at ${lib.fmt(p.entity.position)} holding ${p.entity.heldItem?.name || 'none'}`);
  }
}

// 2. Step south out of Nether portal hitbox
console.log('Stepping out of portal to (40.5, 65, -8.5)...');
bot.clearControlStates();
await lib.walkTo(40.5, -8.5, 2000);
bot.clearControlStates();
console.log('Now at:', lib.fmt(bot.entity.position));

// 3. Extinguish any fire/soul_fire blocks within 8 blocks
function extinguishNearbyFire() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 8,
    count: 10
  });
  if (fires.length > 0) {
    console.log(`Extinguishing ${fires.length} fire blocks nearby...`);
    for (const fp of fires) {
      try {
        const b = bot.blockAt(fp);
        if (b) bot.dig(b);
      } catch (e) {}
    }
  }
}
extinguishNearbyFire();

// 4. Move to East Ridge starting waypoint (63, 65, -8)
console.log('Moving along cleared valley floor to East Ridge at (63, 65, -8)...');
const toRidge = [
  new Vec3(48.0, 65.0, -8.0),
  new Vec3(56.0, 65.0, -8.0),
  new Vec3(63.0, 65.0, -8.0)
];

for (const wp of toRidge) {
  if (isCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 8000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
  extinguishNearbyFire();
}

console.log('At East Ridge start! Pos:', lib.fmt(bot.entity.position));

// 5. March along proven safe East Ridge waypoints to Fortress Workshop Bunker
const ridgeWaypoints = [
  { name: 'Ridge South (63, 65, -15)', pos: new Vec3(63.0, 65.0, -15) },
  { name: 'Ridge Mid-South (62.5, 66, -30)', pos: new Vec3(62.5, 66.0, -30) },
  { name: 'Ridge Mid (62.0, 65, -55)', pos: new Vec3(62.0, 65.0, -55) },
  { name: 'Ridge North (62.0, 66, -80)', pos: new Vec3(62.0, 66.0, -80) },
  { name: 'Ridge North Bend (61.0, 66, -100)', pos: new Vec3(61.0, 66.0, -100) },
  { name: 'Fortress Approach (50, 65, -115)', pos: new Vec3(50.0, 65.0, -115) },
  { name: 'Fortress Workshop Bunker (44, 65, -127)', pos: new Vec3(44.0, 65.0, -127) }
];

for (let i = 0; i < ridgeWaypoints.length && !isCancelled(); i++) {
  const wp = ridgeWaypoints[i];
  console.log(`[WP ${i + 1}/${ridgeWaypoints.length}] Moving to ${wp.name}...`);
  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 14000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Move note for ${wp.name}:`, e2.message);
    }
  }

  extinguishNearbyFire();
  try { await lib.pickup(6); } catch (e) {}

  // Check health and hostiles
  const hostiles = lib.hostiles(12);
  if (hostiles.length > 0) {
    console.log('Hostiles nearby:', JSON.stringify(hostiles));
  }
}

console.log('\n=== FORTRESS APPROACH STATUS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma reached ${lib.fmt(bot.entity.position)} along East Ridge! Cobble: ${lib.count('cobblestone')}, HP: ${bot.health}/20`);
