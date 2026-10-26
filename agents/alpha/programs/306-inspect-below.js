// programs/306-inspect-below.js
console.log('=== Program 306: Inspect Below Alpha ===');
const pos = bot.entity.position.floored();

for (let y = pos.y; y >= pos.y - 10; y--) {
  const p = new Vec3(pos.x, y, pos.z);
  const b = bot.blockAt(p);
  console.log(`y=${y} (${lib.fmt(p)}): ${b?.name}`);
}

// Check Delta and Beta
if (bot.players.delta?.entity) console.log('Delta pos:', lib.fmt(bot.players.delta.entity.position));
if (bot.players.beta?.entity) console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position));
