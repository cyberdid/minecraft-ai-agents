// programs/406-inspect-portal-blocks.js
console.log('=== INSPECT PORTAL BLOCKS ===');
console.log('Bot pos:', lib.fmt(bot.entity.position));

for (let y = 75; y >= 71; y--) {
  let line = `y=${y}: `;
  for (let x = 297; x <= 301; x++) {
    for (let z = -56; z <= -51; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        line += `(${x},${z})=${b.name} `;
      }
    }
  }
  console.log(line);
}
