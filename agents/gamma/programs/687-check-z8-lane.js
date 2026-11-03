// programs/687-check-z8-lane.js
console.log('Pos:', lib.fmt(bot.entity.position));
for (let x = 40; x <= 47; x++) {
  for (let z = -9; z <= -6; z++) {
    const b63 = bot.blockAt(new Vec3(x, 63, z))?.name;
    const b64 = bot.blockAt(new Vec3(x, 64, z))?.name;
    const b65 = bot.blockAt(new Vec3(x, 65, z))?.name;
    const b66 = bot.blockAt(new Vec3(x, 66, z))?.name;
    console.log(`(${x}, ${z}): y63=${b63}, y64=${b64}, y65=${b65}, y66=${b66}`);
  }
}
return { pos: bot.entity.position };
