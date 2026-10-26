// programs/168-check-ceiling.js
const p = bot.entity.position.floored();
console.log('Pos:', lib.fmt(p));
for (let y = p.y; y <= p.y + 10; y++) {
  console.log(`Block at y=${y}: ${bot.blockAt(new Vec3(p.x, y, p.z))?.name}`);
}
