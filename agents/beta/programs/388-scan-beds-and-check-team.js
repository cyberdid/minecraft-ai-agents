// programs/388-scan-beds-and-check-team.js
console.log('=== Step: Scan beds inside base and check chat ===');
console.log(`Beta health: ${bot.health}/20, food: ${bot.food}/20`);

// Scan for beds
const beds = bot.findBlocks({
  matching: b => b.name.endsWith('_bed'),
  maxDistance: 8,
  count: 10
});
console.log(`Beds found in base (${beds.length}):`);
for (const b of beds) {
  const block = bot.blockAt(b);
  console.log(`  Bed at ${lib.fmt(b)}: ${block.name}`);
}

// Check team locations
for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity) {
    const pos = player.entity.position;
    const dist = bot.entity.position.distanceTo(pos).toFixed(1);
    console.log(`Player ${name}: pos=${lib.fmt(pos)}, dist=${dist}m, held=${player.entity.heldItem?.name}`);
  }
}
