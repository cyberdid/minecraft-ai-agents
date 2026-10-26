// programs/271-check-portal-coords.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

for (let x = 297; x <= 301; x++) {
  for (let z = -55; z <= -52; z++) {
    const b = bot.blockAt(new Vec3(x, 73, z));
    const floor = bot.blockAt(new Vec3(x, 72, z));
    if (b?.name !== 'air' || floor?.name !== 'air') {
      console.log(`(${x}, y73, ${z})=${b?.name} | floor(y72)=${floor?.name}`);
    }
  }
}
