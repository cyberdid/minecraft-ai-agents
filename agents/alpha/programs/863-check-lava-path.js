// programs/863-check-lava-path.js
console.log('=== Program 863: Check Lava Path to Open Ocean ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

for (let x = 30; x <= 38; x += 2) {
  const col = [];
  for (let y = 22; y <= 33; y++) {
    const b = bot.blockAt(new Vec3(x, y, -48));
    if (b && b.name !== 'lava' && b.name !== 'air') {
      col.push(`y${y}:${b.name}`);
    }
  }
  console.log(`x=${x}, z=-48: solids = [${col.join(', ')}]`);
}
