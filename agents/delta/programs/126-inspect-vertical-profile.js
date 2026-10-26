// programs/126-inspect-vertical-profile.js
console.log('Pos:', lib.fmt(bot.entity.position));

for (let z = -134; z >= -140; z -= 2) {
  for (let x = 43; x <= 45; x += 2) {
    let solidBlocks = [];
    for (let y = 50; y <= 80; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        solidBlocks.push(`y=${y}:${b.name}`);
      }
    }
    console.log(`Column (${x}, ~, ${z}) solid blocks: ${solidBlocks.join(', ') || 'NONE'}`);
  }
}
