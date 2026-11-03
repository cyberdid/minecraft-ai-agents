// programs/857-inspect-ceiling.js
console.log('=== Program 857: Inspect Ceiling ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

for (let x = 37; x <= 39; x++) {
  for (let z = -49; z <= -47; z++) {
    const col = [];
    for (let y = 30; y <= 34; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      col.push(`y${y}:${b?.name}`);
    }
    console.log(`(${x}, ${z}): ${col.join(', ')}`);
  }
}
