// programs/182-check-south-path.js
console.log('--- CHECK SOUTH PATH AT Z=-52 ---');
for (let x = 294; x <= 300; x++) {
  const col = [];
  for (let y = 71; y <= 74; y++) {
    const b = bot.blockAt(new Vec3(x, y, -52));
    col.push(`y=${y}:${b?.name}`);
  }
  console.log(`x=${x}, z=-52: ${col.join(', ')}`);
}

for (let z = -54; z <= -51; z++) {
  const col = [];
  for (let y = 71; y <= 74; y++) {
    const b = bot.blockAt(new Vec3(299, y, z));
    col.push(`y=${y}:${b?.name}`);
  }
  console.log(`x=299, z=${z}: ${col.join(', ')}`);
}
