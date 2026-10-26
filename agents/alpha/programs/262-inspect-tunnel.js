// programs/262-inspect-tunnel.js
console.log('=== Program 262: Inspect Tunnel Around Alpha ===');
const pos = bot.entity.position.floored();
console.log('Bot pos:', lib.fmt(pos));

// Check in all 4 cardinal directions at feet (dy=0), head (dy=1), eye+1 (dy=2)
const dirs = [
  { name: '+X (East)', dx: 1, dz: 0 },
  { name: '-X (West)', dx: -1, dz: 0 },
  { name: '+Z (South)', dx: 0, dz: 1 },
  { name: '-Z (North)', dx: 0, dz: -1 }
];

for (const d of dirs) {
  let line = `${d.name}: `;
  for (let dist = 1; dist <= 8; dist++) {
    const pFeet = pos.offset(d.dx * dist, 0, d.dz * dist);
    const bFeet = bot.blockAt(pFeet);
    const bHead = bot.blockAt(pFeet.offset(0, 1, 0));
    const bFloor = bot.blockAt(pFeet.offset(0, -1, 0));
    line += `[d=${dist}: f=${bFloor?.name}, at=${bFeet?.name}, h=${bHead?.name}] `;
    if (bFeet?.name !== 'air' && bFeet?.name !== 'cave_air') break;
  }
  console.log(line);
}

// Check vertical blocks directly above and below bot
for (let dy = -3; dy <= 5; dy++) {
  const p = pos.offset(0, dy, 0);
  const b = bot.blockAt(p);
  console.log(`dy=${dy} (${lib.fmt(p)}): ${b?.name}`);
}

// Also check chat messages and beta's position
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
