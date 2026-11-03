// programs/330-warp-and-march-to-frontline.js
console.log('=== NETHER WARP & FRONTLINE MARCH ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobblestone:', lib.count('cobblestone'));

// 1. Enter Nether portal at (299.5, 73.0, -53.5)
if (bot.game.dimension === 'overworld') {
  console.log('Moving to Overworld Nether portal at (299.5, 73.0, -53.5)...');
  try {
    await lib.goTo(299, 72, -52, 1, { timeoutMs: 6000 });
  } catch (e) {}

  bot.setControlState('jump', true);
  await lib.walkTo(299.5, -53.5, 3000);
  bot.clearControlStates();

  console.log('Inside portal, waiting for Nether dimension shift...');
  const t0 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
    await sleep(500);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Failed to transit to Nether!');
  bot.chat('gamma: Portal transit failed');
  return;
}

bot.chat(`gamma arrived in Nether with ${lib.count('cobblestone')} cobble & stone sword! Marching to Spawner Frontline!`);

// 2. Step south out of Nether portal hitbox into bunker
console.log('Stepping out of portal to (40.5, 65.0, -8.5)...');
bot.clearControlStates();
await lib.walkTo(40.5, -8.5, 2000);
bot.clearControlStates();

// Equip stone sword
await lib.equipWeapon();

// 3. Move along cleared valley floor to East Ridge at (63, 65, -8)
console.log('Moving to East Ridge (63, 65, -8)...');
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

// 4. March along verified safe East Ridge waypoints to Fortress Workshop
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
    } catch (e2) {}
  }
  try { await lib.pickup(5); } catch (e) {}
}

console.log('Arrived at Fortress Workshop Bunker! Pos:', lib.fmt(bot.entity.position));

// 5. March through covered tunnel to Frontline Blast Wall & Fortified Cross-Bridge
const tunnelWaypoints = [
  { name: 'Covered Tunnel Mid (44, 65, -145)', pos: new Vec3(44.0, 65.0, -145) },
  { name: 'Covered Tunnel North (44, 65, -160)', pos: new Vec3(44.0, 65.0, -160) },
  { name: 'Frontline Blast Wall (44, 65, -169)', pos: new Vec3(44.0, 65.0, -169) },
  { name: 'Fortified Cross-Bridge (38, 65, -176)', pos: new Vec3(38.0, 65.0, -176) },
  { name: 'Spawner Balcony Deck (34, 67, -187)', pos: new Vec3(34.0, 67.0, -187) }
];

for (let i = 0; i < tunnelWaypoints.length && !isCancelled(); i++) {
  const wp = tunnelWaypoints[i];
  console.log(`[Tunnel WP ${i + 1}/${tunnelWaypoints.length}] Moving to ${wp.name}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 14000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {}
  }
  try { await lib.pickup(5); } catch (e) {}
}

console.log('\n=== FRONTLINE ARRIVAL ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'));

// Scan for Blaze Spawner & Blazes
const spawners = bot.findBlocks({ matching: b => b && b.name === 'spawner', maxDistance: 20, count: 2 });
console.log(`Spawners visible (${spawners.length}):`, spawners.map(p => lib.fmt(p)));

const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze');
console.log(`Blazes visible (${blazes.length}):`, blazes.map(b => `${b.name} at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m)`));

bot.chat(`gamma UNITED at Spawner Frontline ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword! Ready to enclose Spawner!`);
