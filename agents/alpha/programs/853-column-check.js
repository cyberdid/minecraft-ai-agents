// programs/853-column-check.js
console.log('=== Program 853: Column Check ===');
const p = bot.entity.position;
console.log('Alpha at:', lib.fmt(p));

for (let y = Math.floor(p.y); y <= 36; y++) {
  const b = bot.blockAt(new Vec3(38, y, -48));
  console.log(`(38, ${y}, -48): ${b?.name} (solid=${b?.boundingBox === 'block'})`);
}
