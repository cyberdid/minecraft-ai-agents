// programs/553-inspect-portal-blocks.js
console.log('=== INSPECT PORTAL BLOCKS ===');
console.log('Pos:', bot.entity.position);
const standingBlock = bot.blockAt(bot.entity.position);
console.log('Block at bot.entity.position:', standingBlock ? standingBlock.name : 'null');
const floorBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
console.log('Block below bot:', floorBlock ? floorBlock.name : 'null');

console.log('Scanning 298..302, 72..75, -55..-53:');
for (let x = 298; x <= 301; x++) {
  for (let y = 72; y <= 75; y++) {
    for (let z = -55; z <= -53; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
