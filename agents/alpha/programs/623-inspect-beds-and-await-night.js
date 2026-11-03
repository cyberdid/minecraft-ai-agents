// programs/623-inspect-beds-and-await-night.js
console.log('=== Program 623: Inspect Beds & Prepare Night Skip ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check Bed blocks
const bed1Pos = new Vec3(294, 72, -55);
const bed2Pos = new Vec3(293, 72, -56);
const b1 = bot.blockAt(bed1Pos);
const b2 = bot.blockAt(bed2Pos);
console.log('Bed 1 at', lib.fmt(bed1Pos), 'type:', b1?.name);
console.log('Bed 2 at', lib.fmt(bed2Pos), 'type:', b2?.name);

// 2. Check nearby players
for (const pName of Object.keys(bot.players)) {
  const p = bot.players[pName];
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${pName} at ${lib.fmt(p.entity.position)} (dist ${dist.toFixed(1)}m)`);
  }
}

// 3. Check time to night
const timeToNight = lib.timeToNight();
console.log('Current time:', bot.time.timeOfDay, 'timeToNight:', timeToNight);
bot.chat(`alpha: At Base shelter (293, 72, -55) awaiting Beta! Bed 1: ${b1?.name}, Bed 2: ${b2?.name}. Night in ${timeToNight}s.`);

// If night is close (< 30s) or active, attempt to sleep
if (timeToNight <= 10) {
  console.log('Night is imminent or active! Attempting to sleep...');
  const bedBlock = (b1 && b1.name.includes('bed')) ? b1 : ((b2 && b2.name.includes('bed')) ? b2 : null);
  if (bedBlock) {
    try {
      await lib.sleepIn(bedBlock.position);
      console.log('Sleeping in bed!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}
