// programs/690-inspect-portal1-straight-path.js
console.log('Pos:', lib.fmt(bot.entity.position));

for (let z = -6; z <= 4; z++) {
  const f = bot.blockAt(new Vec3(46, 65, z));
  const b0 = bot.blockAt(new Vec3(46, 66, z));
  const b1 = bot.blockAt(new Vec3(46, 67, z));
  const f47 = bot.blockAt(new Vec3(47, 65, z));
  const b0_47 = bot.blockAt(new Vec3(47, 66, z));
  const b1_47 = bot.blockAt(new Vec3(47, 67, z));
  console.log(`z=${z}: x46: [y65=${f?.name}, y66=${b0?.name}, y67=${b1?.name}] | x47: [y65=${f47?.name}, y66=${b0_47?.name}, y67=${b1_47?.name}]`);
}
