// programs/157-check-door-and-gear.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Check door at (294, 72, -54)
const d = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door at (294, 72, -54):', d?.name);

// Check if items are at current position (293, 52, -55)
const nearbyDrops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position && e.position.distanceTo(bot.entity.position) < 8);
console.log(`Nearby drops (${nearbyDrops.length}):`);
for (const drop of nearbyDrops) {
  console.log(`  Drop at ${lib.fmt(drop.position)}`);
}

// Check where Beta is
for (const p of Object.values(bot.players)) {
  if (p && p.entity && p.username !== bot.username) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}`);
  }
}
