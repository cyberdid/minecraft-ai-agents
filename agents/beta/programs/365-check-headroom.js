// programs/365-check-headroom.js
console.log('=== Check headroom at x=307..308 ===');

for (let y = 30; y <= 34; y++) {
  let line = `y=${y}: `;
  for (let z = -42; z <= -41; z++) {
    for (let x = 307; x <= 308; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      line += `(${x},${z}:${b ? b.name : 'null'}) `;
    }
  }
  console.log(line);
}
