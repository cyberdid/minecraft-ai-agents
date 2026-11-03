// programs/626-find-water-source.js
console.log('=== FIND WATER SOURCE BLOCK ===');
const waters = bot.findBlocks({
  matching: b => b && b.name === 'water',
  maxDistance: 8,
  count: 20
});
for (const wp of waters) {
  const b = bot.blockAt(wp);
  if (b.metadata === 0) {
    console.log(`FOUND WATER SOURCE AT ${lib.fmt(wp)}!`);
    console.log('Plugging water source with cobblestone...');
    await lib.place('cobblestone', wp.x, wp.y, wp.z);
    console.log('Planted cobblestone at water source!');
    break;
  }
}

// Check time
console.log('Time of day:', bot.time.timeOfDay, 'isNight:', bot.time.isNight);
