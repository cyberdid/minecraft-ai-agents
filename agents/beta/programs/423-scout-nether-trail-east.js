// programs/423-scout-nether-trail-east.js
console.log('=== Step: Scout East (+X) from Nether bunker and place trail markers ===');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// Scout along East (+X) from (40, 65, -7) out to x=70
const trailWaypoints = [
  new Vec3(48, 65, -7),
  new Vec3(58, 65, -7),
  new Vec3(68, 65, -7)
];

for (const wp of trailWaypoints) {
  if (isCancelled()) break;
  try {
    console.log(`Advancing to ${lib.fmt(wp)}...`);
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
    
    // Place a 2-high cobblestone marker pillar
    const markerPos = bot.entity.position.offset(1, 0, 0).floored();
    await lib.place('cobblestone', markerPos.x, markerPos.y, markerPos.z);
    await lib.place('cobblestone', markerPos.x, markerPos.y + 1, markerPos.z);
    console.log(`Placed trail marker at ${lib.fmt(markerPos)}`);
  } catch (e) {
    console.log(`Trail note at ${lib.fmt(wp)}:`, e.message);
  }

  // Scan for fortress blocks
  const fortressBlocks = bot.findBlocks({
    matching: b => b.name.includes('nether_brick') || b.name === 'spawner',
    maxDistance: 45,
    count: 10
  });
  if (fortressBlocks.length > 0) {
    console.log(`*** NETHER FORTRESS SPOTTED AT ${lib.fmt(fortressBlocks[0])}! ***`);
    bot.chat(`beta: NETHER FORTRESS FOUND at ${lib.fmt(fortressBlocks[0])}!`);
    break;
  }
}

bot.chat(`beta: East trail scouted to ${lib.fmt(bot.entity.position)}. Cobble remaining: ${lib.count('cobblestone')}. Continuing expedition!`);
