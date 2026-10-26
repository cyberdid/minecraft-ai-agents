// programs/125-inspect-bridge-gap.js
console.log('Pos:', lib.fmt(bot.entity.position));

console.log('Inspecting gap from z=-130 to z=-138:');
for (let z = -130; z >= -138; z--) {
  let line = `z=${z}: `;
  for (let x = 42; x <= 46; x++) {
    // Check y=64 to 67
    let col = '';
    for (let y = 64; y <= 67; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      const n = b ? (b.name === 'air' || b.name === 'cave_air' ? '.' : b.name[0]) : '?';
      col += n;
    }
    line += `(x${x}:${col}) `;
  }
  console.log(line);
}

// Legend
const blocks = new Set();
for (let z = -130; z >= -138; z--) {
  for (let x = 42; x <= 46; x++) {
    for (let y = 64; y <= 67; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        blocks.add(`${b.name[0]} = ${b.name}`);
      }
    }
  }
}
console.log('Legend:', Array.from(blocks).join(', '));
