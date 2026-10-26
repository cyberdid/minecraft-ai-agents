// programs/462-inspect-base-layout.js
console.log('=== Step: Inspect Base Layout ===');
console.log('Pos:', lib.fmt(bot.entity.position));

for (let x = 291; x <= 296; x++) {
  for (let z = -58; z <= -53; z++) {
    for (let y = 71; y <= 74; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
