// programs/232-find-path-solids.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Print all solid blocks between z=-163 and z=-187
const pathBlocks = [];
for (let z = -163; z >= -187; z--) {
  for (let x = 30; x <= 46; x++) {
    for (let y = 63; y <= 66; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'lava') {
        pathBlocks.push({ x, y, z, name: b.name });
      }
    }
  }
}

console.log(`Found ${pathBlocks.length} solid blocks in path corridor (z: -163 to -187):`);
for (const b of pathBlocks) {
  console.log(`  (${b.x}, ${b.y}, ${b.z}): ${b.name}`);
}
