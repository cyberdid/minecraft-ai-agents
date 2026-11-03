// programs/421-find-shore.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Check blocks along +x, -x, +z, -z to find shore
for (let d = 1; d <= 25; d++) {
  const bx = bot.blockAt(bot.entity.position.offset(d, 0, 0));
  const bxDown = bot.blockAt(bot.entity.position.offset(d, -1, 0));
  const bxUp = bot.blockAt(bot.entity.position.offset(d, 1, 0));
  if (bx && bx.name !== 'water' && bx.name !== 'air') {
    console.log(`Solid block +X at d=${d} (${bot.entity.position.x + d}, ${bx.position.y}, ${bx.position.z}): ${bx.name}`);
    break;
  }
}

for (let d = 1; d <= 25; d++) {
  const bz = bot.blockAt(bot.entity.position.offset(0, 0, d));
  if (bz && bz.name !== 'water' && bz.name !== 'air') {
    console.log(`Solid block +Z at d=${d}: ${bz.name}`);
    break;
  }
}

for (let d = 1; d <= 25; d++) {
  const bz = bot.blockAt(bot.entity.position.offset(0, 0, -d));
  if (bz && bz.name !== 'water' && bz.name !== 'air') {
    console.log(`Solid block -Z at d=${d}: ${bz.name}`);
    break;
  }
}
