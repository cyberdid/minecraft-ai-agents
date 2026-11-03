console.log('=== PROGRAM 711: INSPECT GRID (47..52, -7..2) ===');
for (let z = -7; z <= 2; z++) {
  let line = `z=${z}: `;
  for (let x = 52; x >= 46; x--) {
    const b = bot.blockAt(new Vec3(x, 65, z));
    const fl = bot.blockAt(new Vec3(x, 64, z));
    const shortName = b ? (b.name === 'air' ? '.' : b.name[0]) : '?';
    const flShort = fl ? (fl.name === 'air' ? '_' : fl.name[0]) : '?';
    line += `[${x}:${flShort}${shortName}] `;
  }
  console.log(line);
}
