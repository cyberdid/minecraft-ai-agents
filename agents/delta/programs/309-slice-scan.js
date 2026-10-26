// programs/309-slice-scan.js
console.log('Delta pos:', bot.entity.position);

for (let z = -6; z >= -10; z--) {
  let line = `z=${z}: `;
  for (let y = 63; y <= 68; y++) {
    const b = bot.blockAt(new Vec3(63, y, z));
    line += `[y${y}:${b?.name || 'null'}] `;
  }
  console.log(line);
}
