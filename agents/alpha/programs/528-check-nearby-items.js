// programs/528-check-nearby-items.js
console.log('=== Program 528: Check Nearby Drops & Teammate Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check all dropped items within 24m
const items = Object.values(bot.entities).filter(e => e && e.name === 'item' && bot.entity.position.distanceTo(e.position) < 24);
console.log(`Found ${items.length} dropped item entities within 24m:`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  console.log(`  Drop at ${lib.fmt(it.position)} (dist ${d.toFixed(1)}m)`);
}

// 2. Check blocks around (44, 65, -160)
console.log('(44, 65, -160):', bot.blockAt(new Vec3(44, 65, -160))?.name);
console.log('(44, 66, -160):', bot.blockAt(new Vec3(44, 66, -160))?.name);

// 3. Check Beta's position
const beta = bot.players['beta']?.entity;
if (beta) {
  console.log('Beta at:', lib.fmt(beta.position), 'dist:', bot.entity.position.distanceTo(beta.position).toFixed(1));
} else {
  console.log('Beta entity not found.');
}
