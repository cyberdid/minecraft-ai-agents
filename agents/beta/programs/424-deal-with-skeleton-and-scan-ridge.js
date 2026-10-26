// programs/424-deal-with-skeleton-and-scan-ridge.js
console.log('=== Step: Eliminate nearby skeleton and scan ridge for Fortress ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check nearby hostiles and engage if close
const skeleton = Object.values(bot.entities).find(e => e.name === 'skeleton' && bot.entity.position.distanceTo(e.position) < 16);
if (skeleton) {
  console.log(`Skeleton detected at ${lib.fmt(skeleton.position)}, distance=${bot.entity.position.distanceTo(skeleton.position).toFixed(1)}m. Engaging with sword and shield...`);
  try {
    await lib.fight(12, 10);
    console.log('Hostile handled. HP:', bot.health);
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}

// 2. Scan broad radius (up to 80 blocks) for Nether Fortress materials
const fortressBlocks = bot.findBlocks({
  matching: b => b.name.includes('nether_brick') || b.name === 'spawner',
  maxDistance: 80,
  count: 10
});

console.log(`Scan results: ${fortressBlocks.length} fortress blocks found within 80m.`);
if (fortressBlocks.length > 0) {
  console.log(`*** NETHER FORTRESS FOUND AT ${lib.fmt(fortressBlocks[0])}! ***`);
  bot.chat(`beta: NETHER FORTRESS CONFIRMED at ${lib.fmt(fortressBlocks[0])}! Team assemble to raid!`);
} else {
  // Check for Nether Gold Ore or Nether Quartz Ore along ridge
  const ores = bot.findBlocks({
    matching: b => b.name.includes('nether_gold_ore') || b.name.includes('nether_quartz_ore'),
    maxDistance: 15,
    count: 5
  });
  console.log(`Nether ores nearby on ridge: ${ores.length}`);
}

bot.chat(`beta: At East ridge ${lib.fmt(bot.entity.position)}. HP=${bot.health}/20, Food=${bot.food}/20. Scouting towards next sector!`);
