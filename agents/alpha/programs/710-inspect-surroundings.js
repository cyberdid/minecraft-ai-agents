// programs/710-inspect-surroundings.js
console.log('=== Alpha surroundings at:', lib.fmt(bot.entity.position));

const cur = bot.entity.position.floored();
for (let dy = -1; dy <= 2; dy++) {
  console.log(`\nLayer y = ${cur.y + dy}:`);
  for (let dz = -2; dz <= 2; dz++) {
    let row = '';
    for (let dx = -2; dx <= 2; dx++) {
      const p = cur.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      const name = b ? b.name : 'null';
      const short = name === 'air' ? '   .' : name.substring(0, 4);
      row += short.padEnd(5, ' ');
    }
    console.log(`dz=${dz.toString().padStart(2, ' ')}: ${row}`);
  }
}
