// programs/685-inspect-exact-blocks-gamma.js
const pos = bot.entity.position;
console.log('Gamma exact pos:', pos);

for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const x = Math.floor(pos.x) + dx;
    const z = Math.floor(pos.z) + dz;
    const b64 = bot.blockAt(new Vec3(x, 64, z));
    const b65 = bot.blockAt(new Vec3(x, 65, z));
    const b66 = bot.blockAt(new Vec3(x, 66, z));
    console.log(`(${x}, ${z}): y64=${b64?.name}(${b64?.boundingBox}), y65=${b65?.name}(${b65?.boundingBox}), y66=${b66?.name}(${b66?.boundingBox})`);
  }
}
