// programs/241-check-portal-blocks.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

for (let y = 71; y <= 74; y++) {
  for (let z = -55; z <= -53; z++) {
    const b = bot.blockAt(new Vec3(298, y, z));
    console.log(`(298, ${y}, ${z}): ${b?.name}`);
  }
}
