// programs/305-inspect-stuck.js
console.log('=== Inspect exact blocks at beta ===');
const pos = bot.entity.position;
console.log('Exact pos:', pos);
console.log('onGround:', bot.entity.onGround);
console.log('velocity:', bot.entity.velocity);

const bx = Math.floor(pos.x);
const by = Math.floor(pos.y);
const bz = Math.floor(pos.z);

for (let y = by - 1; y <= by + 2; y++) {
  for (let z = bz - 1; z <= bz + 1; z++) {
    for (let x = bx - 1; x <= bx + 1; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      console.log(`Block at (${x}, ${y}, ${z}): ${b ? b.name : 'null'} (bb: ${b?.boundingBox})`);
    }
  }
}
