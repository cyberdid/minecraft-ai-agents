for (let y = 64; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(49, y, -8));
  console.log(`y=${y}: ${b?.name}`);
}
for (let y = 64; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(55, y, -8));
  if (b?.name !== 'air') console.log(`x=55, y=${y}: ${b?.name}`);
}
for (let y = 64; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(63, y, -8));
  if (b?.name !== 'air') console.log(`x=63, y=${y}: ${b?.name}`);
}
