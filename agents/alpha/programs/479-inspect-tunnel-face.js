// programs/479-inspect-tunnel-face.js
console.log('=== Program 479: Inspect Tunnel Face ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const pos = bot.entity.position;
const curX = Math.round(pos.x);
const curY = Math.round(pos.y);
const curZ = Math.round(pos.z);

console.log(`Current grid: (${curX}, ${curY}, ${curZ})`);

for (let dz = 0; dz >= -5; dz--) {
  for (let dx = 0; dx >= -2; dx--) {
    const x = curX + dx;
    const z = curZ + dz;
    const floor = bot.blockAt(new Vec3(x, curY - 1, z))?.name;
    const feet = bot.blockAt(new Vec3(x, curY, z))?.name;
    const head = bot.blockAt(new Vec3(x, curY + 1, z))?.name;
    const roof = bot.blockAt(new Vec3(x, curY + 2, z))?.name;
    console.log(`(${x}, ${z}): floor(${curY - 1})=${floor}, feet(${curY})=${feet}, head(${curY + 1})=${head}, roof(${curY + 2})=${roof}`);
  }
}
