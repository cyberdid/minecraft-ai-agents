// programs/706-inspect-portal-room-height.js
for (let y = 0; y <= 15; y++) {
  const b = bot.blockAt(new Vec3(2210, y, 1470));
  console.log(`(2210, ${y}, 1470): ${b?.name}`);
}
