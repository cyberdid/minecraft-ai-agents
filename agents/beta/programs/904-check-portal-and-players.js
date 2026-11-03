console.log('=== Program 904: Check Portal & Teammates ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const curBlock = bot.blockAt(bot.entity.position);
console.log('Block at feet:', curBlock ? curBlock.name : 'null');

const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 5 });
if (portalBlock) {
  console.log('Found nether_portal block at:', lib.fmt(portalBlock.position));
} else {
  console.log('No nether_portal block within 5m');
}

for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}, dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  }
}
