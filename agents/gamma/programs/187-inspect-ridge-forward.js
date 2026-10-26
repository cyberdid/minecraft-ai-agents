// programs/187-inspect-ridge-forward.js
console.log('--- INSPECT RIDGE AHEAD FROM (63, 65, -3) ---');
console.log('Pos:', bot.entity.position);

// Check columns from z = -3 to z = -15 along x=62..64
for (let z = -3; z >= -15; z--) {
  const row = [];
  for (let x = 61; x <= 64; x++) {
    const feet = bot.blockAt(new Vec3(x, 65, z));
    const ground = bot.blockAt(new Vec3(x, 64, z));
    const head = bot.blockAt(new Vec3(x, 66, z));
    row.push(`x=${x}:[grd=${ground?.name || 'void'},feet=${feet?.name || 'void'},head=${head?.name || 'void'}]`);
  }
  console.log(`z=${z}: ${row.join(' | ')}`);
}

// Check nearby players
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    console.log(`Player ${p.username}: ${p.entity ? lib.fmt(p.entity.position) : 'offline/far'}`);
  }
}
