// programs/128-check-base-entrance.js
console.log('alpha at:', lib.fmt(bot.entity.position));

for (let z = -51; z >= -56; z--) {
  for (let y = 70; y <= 73; y++) {
    const b = bot.blockAt(new Vec3(294, y, z));
    console.log(`(294, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}
