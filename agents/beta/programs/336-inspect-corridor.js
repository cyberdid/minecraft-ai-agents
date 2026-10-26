// programs/336-inspect-corridor.js
console.log('=== Inspect corridor from z=-31 to z=-38 ===');
const p = bot.entity.position.floored();

for (let z = -31; z >= -38; z--) {
  let line = `z=${z}: `;
  for (let y = 16; y <= 22; y++) {
    for (let x = 299; x <= 302; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        line += `(${x},${y}) `;
      }
    }
  }
  console.log(line);
}
