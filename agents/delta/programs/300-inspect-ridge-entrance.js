// programs/300-inspect-ridge-entrance.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Scan blocks along x=62..64, z=-7..-20
for (let z = -7; z >= -20; z--) {
  let line = `z=${z}: `;
  for (let x = 62; x <= 64; x++) {
    const bFloor = bot.blockAt(new Vec3(x, 64, z));
    const bAt = bot.blockAt(new Vec3(x, 65, z));
    const bHead = bot.blockAt(new Vec3(x, 66, z));
    line += `x${x}:[${bFloor?.name || '?'}, ${bAt?.name || '?'}, ${bHead?.name || '?'}] `;
  }
  console.log(line);
}
