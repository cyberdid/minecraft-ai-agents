// programs/013-inspect-base-room.js
console.log('Teammates:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`  ${name} at ${lib.fmt(p.entity.position)}`);
}

console.log('Base blocks (y=71 floor, y=72 feet):');
for (let y = 71; y <= 73; y++) {
  console.log(`--- y = ${y} ---`);
  for (let z = -58; z <= -54; z++) {
    let row = `z=${z}: `;
    for (let x = 292; x <= 296; x++) {
      const bl = bot.blockAt(new Vec3(x, y, z));
      row += `${x}:${bl ? bl.name : 'null'} `;
    }
    console.log(row);
  }
}
