// programs/547-pave-portal-trail-and-advance.js
console.log('=== Program 547: Pave Portal Trail & Advance to Spawner Bridgehead ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobble in inv:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

await lib.equipWeapon();

// 1. Extinguish any remaining fire blocks within 16m
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 16,
  count: 15
});

for (const fp of fires) {
  try {
    const b = bot.blockAt(fp);
    if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
      console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
      await bot.lookAt(fp.offset(0.5, 0.5, 0.5), true);
      await bot.dig(b);
      await sleep(50);
    }
  } catch (err) {}
}

// 2. Configure pathfinder to strictly avoid all fire & lava
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
bot.pathfinder.setMovements(moves);

// 3. Proven safe waypoints from Portal to Spawner Bridgehead
const waypoints = [
  new Vec3(52, 65, -7),
  new Vec3(63, 64, -7),  // Tunnel mouth at y=64..65
  new Vec3(63, 66, -20), // Inside excavated tunnel
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174)  // Spawner Bridgehead (behind sealed West wall!)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // Pitch down to y=64 to never aggro Endermen
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, 64.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at Spawner Bridgehead! Pos:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Portal trail extinguished! United at Spawner Bridgehead ${lib.fmt(bot.entity.position)} with stone swords & ${lib.count('cobblestone')} cobble!`);

// 4. Scan teammates and hostiles
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

const spawnerPos = new Vec3(32, 68, -190);
console.log(`Distance to Spawner: ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m`);
console.log('Alpha HP:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));
