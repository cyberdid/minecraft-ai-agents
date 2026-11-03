// programs/575-check-beds.js
console.log('=== CHECK BEDS IN BASE ===');
const beds = bot.findBlocks({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 16,
  count: 5
});
console.log('Found beds:', beds.length);
for (const bp of beds) {
  const b = bot.blockAt(bp);
  console.log(`Bed at ${lib.fmt(bp)}: ${b.name}`);
}
