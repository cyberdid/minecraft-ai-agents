// programs/791-exact-box.js
console.log('=== Program 791: Exact Box Around Beta ===');
const p = bot.entity.position;
console.log(`Beta exact pos: x=${p.x}, y=${p.y}, z=${p.z}`);

for (let y = 67; y >= 63; y--) {
  console.log(`--- y = ${y} ---`);
  for (let z = -35; z <= -32; z++) {
    const row = [];
    for (let x = 62; x <= 64; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      row.push(`(${x},${z}):${b ? b.name : 'null'}`);
    }
    console.log(row.join(' | '));
  }
}
