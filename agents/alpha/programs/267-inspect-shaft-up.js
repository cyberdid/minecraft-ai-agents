// programs/267-inspect-shaft-up.js
console.log('=== Program 267: Inspect Shaft Above ===');

for (let y = 23; y <= 40; y++) {
  const p = new Vec3(336, y, -70);
  const b = bot.blockAt(p);
  const north = bot.blockAt(p.offset(0, 0, -1));
  const south = bot.blockAt(p.offset(0, 0, 1));
  const east = bot.blockAt(p.offset(1, 0, 0));
  const west = bot.blockAt(p.offset(-1, 0, 0));
  
  const airNeighbors = [];
  if (north?.name === 'air' || north?.name === 'cave_air') airNeighbors.push('N');
  if (south?.name === 'air' || south?.name === 'cave_air') airNeighbors.push('S');
  if (east?.name === 'air' || east?.name === 'cave_air') airNeighbors.push('E');
  if (west?.name === 'air' || west?.name === 'cave_air') airNeighbors.push('W');
  
  console.log(`y=${y}: (336,${y},-70)=${b?.name} | open sides: ${airNeighbors.join(',')}`);
}

if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
