// programs/098-scan-base-walls.js
console.log('--- SCANNING BASE WALLS & EXITS ---');
const p = bot.entity.position.floored();
console.log('Bot floor pos:', lib.fmt(p));

for (let y = 71; y <= 74; y++) {
  let layer = `y=${y}:\n`;
  for (let z = -58; z <= -52; z++) {
    let row = `z=${z}: `;
    for (let x = 291; x <= 296; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      const name = b ? b.name : 'null';
      row += name.padEnd(16);
    }
    layer += row + '\n';
  }
  console.log(layer);
}
