// programs/668-inspect-portal-nether.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
const p = bot.entity.position.floored();
console.log('Under feet:', bot.blockAt(p.offset(0, -1, 0))?.name);
console.log('At feet:', bot.blockAt(p)?.name);
console.log('At head:', bot.blockAt(p.offset(0, 1, 0))?.name);

// Look around 8 blocks
const nearbyPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log('Nether portal blocks found:', nearbyPortals.map(pt => lib.fmt(pt)));

// Find way down or path towards z=-35
console.log('Waypoints nearby:');
for (const wp of globalThis.NETHER_PILLBOX_WAYPOINTS) {
  const d = bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z));
  console.log(`WP (${wp.x}, ${wp.y}, ${wp.z}) -> dist: ${d.toFixed(1)}`);
}
