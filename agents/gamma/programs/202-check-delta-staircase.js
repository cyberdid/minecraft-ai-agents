// programs/202-check-delta-staircase.js
console.log('--- CHECK DELTA CEILING STAIRCASE AT (43, -151) ---');
console.log('Gamma pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health);

for (let y = 64; y <= 72; y++) {
  const b = bot.blockAt(new Vec3(43, y, -151));
  console.log(`(43, ${y}, -151): ${b?.name || 'air'}`);
}

// Check Delta position and health
if (bot.players.delta?.entity) {
  console.log('Delta pos:', lib.fmt(bot.players.delta.entity.position), 'Delta HP:', bot.players.delta.entity.health || 'full');
}
