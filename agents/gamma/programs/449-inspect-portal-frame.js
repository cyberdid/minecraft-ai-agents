// programs/449-inspect-portal-frame.js
console.log('=== INSPECT OVERWORLD PORTAL FRAME ===');
console.log('Current Gamma pos:', lib.fmt(bot.entity.position));

for (let y = 71; y <= 76; y++) {
  for (let z = -55; z <= -51; z++) {
    for (let x = 298; x <= 301; x++) {
      const p = new Vec3(x, y, z);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
