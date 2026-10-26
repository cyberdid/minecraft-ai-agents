// programs/181-inspect-z136-envelope.js
console.log('Pos:', lib.fmt(bot.entity.position));

console.log('--- Inspecting z=-136 envelope ---');
for (let y = 67; y >= 64; y--) {
  let line = `y=${y}: `;
  for (let x = 43; x <= 45; x++) {
    const b = bot.blockAt(new Vec3(x, y, -136));
    line += `[x${x}: ${b?.name || 'none'}] `;
  }
  console.log(line);
}

// Check adjacent blocks at z=-135
console.log('--- Checking z=-135 solid attachments ---');
console.log('Roof (44, 67, -135):', bot.blockAt(new Vec3(44, 67, -135))?.name);
console.log('West lower (43, 65, -135):', bot.blockAt(new Vec3(43, 65, -135))?.name);
console.log('West upper (43, 66, -135):', bot.blockAt(new Vec3(43, 66, -135))?.name);
console.log('East lower (45, 65, -135):', bot.blockAt(new Vec3(45, 65, -135))?.name);
console.log('East upper (45, 66, -135):', bot.blockAt(new Vec3(45, 66, -135))?.name);
