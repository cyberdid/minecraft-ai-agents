// programs/812-inspect-pillar-footprint.js
console.log('Alpha at:', lib.fmt(bot.entity.position));

for (let z = -123; z >= -127; z--) {
  let row = `z=${z}: `;
  for (let x = 43; x <= 46; x++) {
    const b = bot.blockAt(new Vec3(x, 24, z));
    row += `x${x}=${b ? b.name : 'null'} `;
  }
  console.log(row);
}
