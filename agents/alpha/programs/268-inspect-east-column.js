// programs/268-inspect-east-column.js
console.log('=== Program 268: Inspect (337, y, -70) Column ===');

for (let y = 23; y <= 55; y++) {
  const p = new Vec3(337, y, -70);
  const b = bot.blockAt(p);
  const bFloor = bot.blockAt(p.offset(0, -1, 0));
  console.log(`y=${y}: block=${b?.name}, below=${bFloor?.name}`);
}

// Check Beta
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
