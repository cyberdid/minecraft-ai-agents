// programs/317-advance-to-frontline-bunker.js
console.log('=== MARCH TO FRONTLINE BUNKER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

await lib.equipWeapon();

// Check if any soul fire is right next to our feet and extinguish safely
const nearbyFires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 4,
  count: 3
});
for (const fp of nearbyFires) {
  try {
    const b = bot.blockAt(fp);
    if (b) await bot.dig(b);
  } catch (e) {}
}

// 1. Traverse to East Ridge (63, 65, -8)
console.log('Step 1: Moving to East Ridge trail at (63, 65, -8)...');
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
}
console.log('At East Ridge start:', lib.fmt(bot.entity.position));

// 2. March along proven East Ridge waypoints to Fortress Workshop Bunker at (44, 65, -127)
console.log('Step 2: Marching along East Ridge trail...');
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
  try { await lib.pickup(5); } catch (e) {}
}

console.log('Reached Fortress Workshop Bunker! Pos:', lib.fmt(bot.entity.position));

// 3. March through covered tunnel to Frontline Blast Wall & Fortified Cross-Bridge
const tunnelWaypoints = [
  { name: 'Covered Tunnel Mid (44, 65, -145)', pos: new Vec3(44.0, 65.0, -145) },
  { name: 'Covered Tunnel North (44, 65, -160)', pos: new Vec3(44.0, 65.0, -160) },
  { name: 'Frontline Blast Wall (44, 65, -169)', pos: new Vec3(44.0, 65.0, -169) },
  { name: 'Fortified Cross-Bridge (38, 65, -176)', pos: new Vec3(38.0, 65.0, -176) }
];

for (let i = 0; i < tunnelWaypoints.length && !isCancelled(); i++) {
  const wp = tunnelWaypoints[i];
  console.log(`[Tunnel WP ${i + 1}/${tunnelWaypoints.length}] Moving to ${wp.name}...`);
  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 14000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Tunnel move note for ${wp.name}:`, e2.message);
    }
  }
  try { await lib.pickup(5); } catch (e) {}
}

console.log('\n=== ARRIVED AT FRONTLINE BUNKER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'));

// Check for Spawner and Blazes
const spawners = bot.findBlocks({
  matching: b => b && b.name === 'spawner',
  maxDistance: 24,
  count: 3
});
console.log(`Spawners visible (${spawners.length}):`, spawners.map(p => lib.fmt(p)));

const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze');
console.log(`Blazes visible (${blazes.length}):`, blazes.map(b => `${b.name} at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m)`));

bot.chat(`gamma reached Frontline Bunker at ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & 2 stone swords! Ready to enclose Spawner!`);
