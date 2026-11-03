// programs/400-nether-expedition-spawner-assault.js
console.log('=== DAWN NETHER EXPEDITION & BLAZE SPAWNER ASSAULT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));

bot.chat('gamma: Dawn arrived! Moving from base into Nether portal for Blaze Spawner assault.');

// 1. If in overworld, exit base door and transit portal
if (bot.game.dimension !== 'the_nether') {
  console.log('Exiting base door to outside...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
      await lib.door(294, 72, -54, false);
    } catch (e2) {}
  }

  console.log('Moving to Nether portal at (298, 72, -54)...');
  const portalEntry = new Vec3(297.0, 72.0, -53.5);
  try {
    await lib.goTo(portalEntry.x, portalEntry.y, portalEntry.z, 1, { dig: false, timeoutMs: 8000 });
  } catch (e) {
    await bot.pathfinder.goto(new goals.GoalNear(portalEntry.x, portalEntry.y, portalEntry.z, 1));
  }

  console.log('Stepping inside portal block at (298.5, 73.0, -53.5)...');
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(298, 73, -54));
  } catch (e) {}

  console.log('Waiting for Nether transit...');
  const transitDeadline = Date.now() + 15000;
  while (Date.now() < transitDeadline && bot.game.dimension !== 'the_nether' && !isCancelled()) {
    await sleep(500);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Transit failed or still in overworld:', bot.game.dimension);
  return { error: 'Not in nether', pos: bot.entity.position };
}

console.log('IN THE NETHER! Current pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: In Nether! Stepping clear of portal and beginning East Ridge march.');

// Step clear of portal hitbox
try {
  await lib.walkTo(40.5, -8.5, 2000);
} catch (e) {}
bot.clearControlStates();

// Configure strict fire avoidance
if (typeof configureFireAvoidance === 'function') {
  configureFireAvoidance();
}

async function extinguishNearbyHazards() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 5,
    count: 6
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
await lib.equipWeapon();

// Safe East Ridge Waypoints to Spawner Balcony
const marchWaypoints = [
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
  { name: 'Fortified Cross-Bridge', pos: new Vec3(38.0, 65.0, -176.0) },
  { name: 'Spawner Balcony Deck', pos: new Vec3(36.0, 66.0, -187.0) }
];

console.log('Marching along East Ridge trail...');
for (let i = 0; i < marchWaypoints.length && !isCancelled(); i++) {
  const wp = marchWaypoints[i];
  if (bot.entity.position.distanceTo(wp.pos) < 3.0) continue; // already past
  console.log(`[WP ${i + 1}/${marchWaypoints.length}] ${wp.name}...`);
  await extinguishNearbyHazards();

  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Nav note to ${wp.name}:`, e2.message);
    }
  }

  await extinguishNearbyHazards();
  try { await lib.pickup(4); } catch (e) {}

  if (bot.health <= 8) {
    console.log('Health dropped to', bot.health, '- pausing march behind cover!');
    break;
  }
}

console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: At Spawner Balcony! Engaging Blazes with stone_sword from behind pillbox wall.');

// Combat loop
const combatEnd = Date.now() + 40000;
let initialRods = lib.count('blaze_rod');

while (Date.now() < combatEnd && !isCancelled()) {
  if (bot.health <= 10) {
    console.log(`Health warning: HP=${bot.health}. Tactical retreat behind blast wall at (44, 65, -169)!`);
    bot.chat('gamma: HP low, falling back behind blast wall at (44, 65, -169)!');
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
    break;
  }

  const blaze = bot.nearestEntity(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) <= 4.5);
  if (blaze) {
    console.log(`Attacking Blaze at ${lib.fmt(blaze.position)}...`);
    await bot.lookAt(blaze.position.offset(0, 1.2, 0), true);
    bot.attack(blaze);
    await sleep(650);
    bot.attack(blaze);
    await sleep(650);
  } else {
    try { await lib.pickup(4); } catch (e) {}
    await sleep(800);
  }

  const rodsNow = lib.count('blaze_rod');
  if (rodsNow > initialRods) {
    console.log(`*** BLAZE ROD COLLECTED! Total: ${rodsNow} ***`);
    bot.chat(`gamma: Harvested Blaze Rod! Total inventory: ${rodsNow}`);
    initialRods = rodsNow;
  }
}

try { await lib.pickup(6); } catch (e) {}
console.log('Expedition round complete! Final inv:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  rods: lib.count('blaze_rod'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
