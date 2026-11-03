// programs/554-inspect-full-frame.js
console.log('=== INSPECT FULL FRAME ===');
for (let x = 297; x <= 302; x++) {
  for (let y = 71; y <= 77; y++) {
    for (let z = -55; z <= -53; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
const flint = bot.inventory.items().find(i => i.name.includes('flint'));
console.log('Flint and steel in inv?', flint ? flint.name : 'no');
