// programs/405-inspect-portal-approach.js
for (let y = 74; y >= 71; y--) {
  let line = `y=${y}: `;
  for (let z = -58; z <= -53; z++) {
    const b = bot.blockAt(new Vec3(299, y, z));
    line += `[z=${z}: ${b ? b.name : 'null'}] `;
  }
  console.log(line);
}
