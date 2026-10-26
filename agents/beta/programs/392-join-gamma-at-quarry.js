// programs/392-join-gamma-at-quarry.js
console.log('=== Step: Move towards East Hill quarry (405, 57, 50) and mine iron ===');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Check for iron ore around current position
let ironBlocks = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 25,
  count: 20
});
console.log(`Iron ore near (350, 61, -35): ${ironBlocks.length}`);

for (const ip of ironBlocks) {
  if (isCancelled()) break;
  try {
    console.log(`Mining iron at ${lib.fmt(ip)}...`);
    await lib.goTo(ip.x, ip.y, ip.z, 2);
    await lib.dig(ip.x, ip.y, ip.z);
    console.log(`Mined iron! raw_iron count: ${lib.count('raw_iron')}`);
  } catch (e) {
    console.log('Mine iron note:', e.message);
  }
}

// 2. Waypoints heading towards quarry (405, 57, 50)
const quarryWaypoints = [
  new Vec3(370, 60, -10),
  new Vec3(390, 58, 20),
  new Vec3(405, 57, 50)
];

for (const wp of quarryWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Nav error to ${lib.fmt(wp)}:`, err.message);
  }

  // Scan for iron ore around each waypoint
  const ores = bot.findBlocks({
    matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
    maxDistance: 20,
    count: 20
  });
  if (ores.length > 0) {
    console.log(`Found ${ores.length} iron ore blocks near ${lib.fmt(wp)}!`);
    for (const op of ores) {
      if (isCancelled()) break;
      try {
        await lib.goTo(op.x, op.y, op.z, 2);
        await lib.dig(op.x, op.y, op.z);
        console.log(`Mined iron at ${lib.fmt(op)}! raw_iron: ${lib.count('raw_iron')}`);
      } catch (e) {
        console.log('Dig ore error:', e.message);
      }
    }
  }
}

// Check if Gamma is in view
const gammaPlayer = bot.players['gamma']?.entity;
if (gammaPlayer) {
  console.log(`Gamma spotted at ${lib.fmt(gammaPlayer.position)}, dist=${bot.entity.position.distanceTo(gammaPlayer.position).toFixed(1)}m`);
}

console.log(`Quarry stage done. Current pos: ${lib.fmt(bot.entity.position)}, raw_iron: ${lib.count('raw_iron')}`);
bot.chat(`beta: At East Hill quarry area ${lib.fmt(bot.entity.position)}. raw_iron=${lib.count('raw_iron')}. Working with Gamma!`);
