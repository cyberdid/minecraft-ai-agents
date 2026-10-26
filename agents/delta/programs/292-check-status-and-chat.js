// programs/292-check-status-and-chat.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Spawn point:', bot.spawnPoint ? lib.fmt(bot.spawnPoint) : 'none');

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${dist.toFixed(1)}m, HP: ${p.entity.metadata?.[9] ?? '?'})`);
  }
}

// Distance to base
const basePos = new Vec3(294, 72, -55);
console.log(`Distance to base: ${bot.entity.position.distanceTo(basePos).toFixed(1)}m`);
