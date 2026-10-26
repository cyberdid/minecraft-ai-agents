// programs/553-scan-mountain-wall-west.js
console.log('=== Step: Scan Mountain Wall West for 100% Covered Route ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan 3D block grid around bot
console.log('Scanning blocks from x=40..45, y=64..69, z=-159..-163:');
for (let z = -159; z >= -163; z--) {
  for (let y = 68; y >= 64; y--) {
    const row = [];
    for (let x = 40; x <= 45; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      row.push(`x=${x}:${b?.name || 'void'}`);
    }
    console.log(`z=${z} y=${y}: ${row.join(' | ')}`);
  }
}

// 2. Check all hostiles within 30m
const hostiles = lib.hostiles(30);
console.log('Hostiles within 30m:', hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

// 3. Check players in range
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  hostiles: hostiles.map(h => ({ name: h.name, dist: h.dist, pos: h.pos }))
};
