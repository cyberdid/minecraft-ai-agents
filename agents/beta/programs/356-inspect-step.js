// programs/356-inspect-step.js
console.log('=== Inspect exact blocks at (303, y, -43) ===');

for (let y = 22; y <= 26; y++) {
  let line = `y=${y}: `;
  for (let z = -44; z <= -42; z++) {
    for (let x = 302; x <= 304; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      line += `(${x},${z}:${b ? b.name : 'null'}) `;
    }
  }
  console.log(line);
}
