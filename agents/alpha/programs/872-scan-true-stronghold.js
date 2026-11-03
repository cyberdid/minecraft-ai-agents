// programs/872-scan-true-stronghold.js
console.log('=== Program 872: Scan True Stronghold at (2240, 35, 1456) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('alpha: ATTENTION TEAM! True Stronghold confirmed at X=2240, Z=1456! Alpha is already at (2240, 35, 1456)! Exploring corridors for End Portal!');

// 1. Scan for Stronghold blocks
const isStronghold = b => b && (b.name.includes('stone_brick') || b.name === 'end_portal_frame' || b.name === 'iron_bars' || b.name === 'spawner');

const nearbyStronghold = bot.findBlocks({
  matching: isStronghold,
  maxDistance: 32,
  count: 50
});

console.log(`Found ${nearbyStronghold.length} Stronghold blocks within 32m:`);
const counts = {};
for (const p of nearbyStronghold) {
  const b = bot.blockAt(p);
  if (b) counts[b.name] = (counts[b.name] || 0) + 1;
}
console.log('Block counts:', JSON.stringify(counts));

// 2. Scan specifically for End Portal Frame blocks
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 64,
  count: 12
});

console.log(`Found ${frames.length}/12 End Portal Frame blocks:`);
for (const p of frames) {
  const b = bot.blockAt(p);
  console.log(`  Frame at ${lib.fmt(p)}: eye=${b?._properties?.eye}`);
}

// 3. Scan for active End Portal
const portal = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 64,
  count: 9
});
console.log(`Found ${portal.length} active End Portal blocks.`);

// 4. Inspect current standing spot and surroundings
console.log('Block under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);
console.log('Block at feet:', bot.blockAt(bot.entity.position)?.name);
console.log('Block at head:', bot.blockAt(bot.entity.position.offset(0, 1.6, 0))?.name);
