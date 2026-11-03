// programs/860-inspect-obstruction-at-288.js
console.log('=== Program 860: Inspect Obstruction between 289 and 285 ===');
const p = bot.entity.position;
console.log(`Pos: ${lib.fmt(p)}`);

for (let x = 290; x >= 284; x--) {
  let line = `x=${x}: `;
  for (let y = 21; y >= 17; y--) {
    for (let z = 6; z <= 8; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      line += `(${y},${z}):${b ? b.name : 'null'} `;
    }
  }
  console.log(line);
}
