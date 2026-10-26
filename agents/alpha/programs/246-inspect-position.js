// programs/246-inspect-position.js
console.log('=== Program 246: Inspect Position & Path ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Block at feet:', bot.blockAt(bot.entity.position)?.name);
console.log('Block below feet:', bot.blockAt(bot.entity.position.offset(0, -1, 0))?.name);

for (let dy = 2; dy >= -2; dy--) {
  let row = `dy=${dy}: `;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      row += `${dx},${dz}:${bot.blockAt(p)?.name} `;
    }
  }
  console.log(row);
}

// Check where Beta is
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position));
}
