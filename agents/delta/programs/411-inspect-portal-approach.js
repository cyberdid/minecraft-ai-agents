// programs/411-inspect-portal-approach.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

console.log('--- z = -55 ---');
for (let x = 295; x <= 300; x++) {
  const bBelow = bot.blockAt(new Vec3(x, 72, -55));
  const bBody = bot.blockAt(new Vec3(x, 73, -55));
  console.log(`x=${x}, z=-55: floor=${bBelow?.name}, body=${bBody?.name}`);
}

console.log('--- z = -53 ---');
for (let x = 295; x <= 300; x++) {
  const bBelow = bot.blockAt(new Vec3(x, 72, -53));
  const bBody = bot.blockAt(new Vec3(x, 73, -53));
  console.log(`x=${x}, z=-53: floor=${bBelow?.name}, body=${bBody?.name}`);
}
