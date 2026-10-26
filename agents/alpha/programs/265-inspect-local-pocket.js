// programs/265-inspect-local-pocket.js
console.log('=== Program 265: Local Pocket Detailed Inspection ===');
const p = bot.entity.position.floored();

for (let y = p.y - 1; y <= p.y + 3; y++) {
  console.log(`--- Y = ${y} ---`);
  for (let z = p.z - 2; z <= p.z + 2; z++) {
    let row = `z=${z}: `;
    for (let x = p.x - 2; x <= p.x + 2; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      row += `[${x},${z}:${b ? b.name : 'null'}] `;
    }
    console.log(row);
  }
}
