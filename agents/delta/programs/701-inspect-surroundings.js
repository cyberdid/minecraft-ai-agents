console.log('=== PROGRAM 701: 3x3x3 SURROUNDING INSPECTION ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const p = bot.entity.position.floored();
for (let dy = -1; dy <= 2; dy++) {
  console.log(`\n--- Y = ${p.y + dy} ---`);
  for (let dz = -2; dz <= 2; dz++) {
    let row = '';
    for (let dx = -2; dx <= 2; dx++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      const name = b ? b.name : 'null';
      row += `[${dx},${dz}:${name}] `;
    }
    console.log(row);
  }
}
