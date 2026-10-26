// programs/134-inspect-east-side.js
console.log('Pos:', lib.fmt(bot.entity.position));

console.log('--- East Corridor/Exterior Inspection ---');
for (let z = -126; z >= -134; z--) {
  let line = `z=${z}: `;
  for (let x = 44; x <= 47; x++) {
    const b64 = bot.blockAt(new Vec3(x, 64, z))?.name || '.';
    const b65 = bot.blockAt(new Vec3(x, 65, z))?.name || '.';
    const b66 = bot.blockAt(new Vec3(x, 66, z))?.name || '.';
    const b67 = bot.blockAt(new Vec3(x, 67, z))?.name || '.';
    line += `(x${x}: 64=${b64.slice(0,4)}, 65=${b65.slice(0,4)}, 66=${b66.slice(0,4)}, 67=${b67.slice(0,4)}) `;
  }
  console.log(line);
}
