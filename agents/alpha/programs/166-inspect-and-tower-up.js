// programs/166-inspect-and-tower-up.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Print blocks around feet and head
const p = bot.entity.position.floored();
console.log('Under feet:', bot.blockAt(p.offset(0, -1, 0))?.name);
console.log('At feet:', bot.blockAt(p)?.name);
console.log('At head:', bot.blockAt(p.offset(0, 1, 0))?.name);
console.log('Above head:', bot.blockAt(p.offset(0, 2, 0))?.name);

for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const wall1 = bot.blockAt(p.offset(dx, 0, dz));
  const wall2 = bot.blockAt(p.offset(dx, 1, dz));
  console.log(`Neighbor (${dx}, ${dz}): y0=${wall1?.name}, y1=${wall2?.name}`);
}

// Tower up 3 blocks using cobblestone
console.log('Towering up 3 blocks with cobblestone...');
for (let i = 0; i < 3; i++) {
  const cobble = bot.inventory.items().find(it => it.name === 'cobblestone');
  if (cobble) {
    await bot.equip(cobble, 'hand');
    bot.setControlState('jump', true);
    await sleep(250);
    const below = bot.entity.position.floored().offset(0, -1, 0);
    try {
      await bot.placeBlock(bot.blockAt(below), new Vec3(0, 1, 0));
    } catch (e) {
      console.log('Place error:', e.message);
    }
    bot.setControlState('jump', false);
    await sleep(250);
  }
}

console.log('Pos after tower:', lib.fmt(bot.entity.position));
