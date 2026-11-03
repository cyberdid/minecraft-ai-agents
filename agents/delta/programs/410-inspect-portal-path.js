// programs/410-inspect-portal-path.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

for (let x = 295; x <= 300; x++) {
  const bBelow = bot.blockAt(new Vec3(x, 72, -54));
  const bBody = bot.blockAt(new Vec3(x, 73, -54));
  const bHead = bot.blockAt(new Vec3(x, 74, -54));
  console.log(`x=${x}: floor=${bBelow?.name}, body=${bBody?.name}, head=${bHead?.name}`);
}
