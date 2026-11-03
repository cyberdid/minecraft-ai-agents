// programs/681-inspect-portal-bunker.js
const pPos = new Vec3(41.5, 65.0, -7.0);
console.log("Portal at:", lib.fmt(pPos));

for (let x = 40; x <= 46; x++) {
  for (let z = -9; z <= -5; z++) {
    const f = bot.blockAt(new Vec3(x, 64, z));
    const b0 = bot.blockAt(new Vec3(x, 65, z));
    const b1 = bot.blockAt(new Vec3(x, 66, z));
    console.log(`(${x}, ${z}): y64=${f?.name}, y65=${b0?.name}, y66=${b1?.name}`);
  }
}
