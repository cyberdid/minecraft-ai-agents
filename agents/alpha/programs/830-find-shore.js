// programs/830-find-shore.js
console.log('=== Find Shore / Solid Land ===');
const p = bot.entity.position;
console.log('Bot pos:', lib.fmt(p));

const solidAboveLava = bot.findBlocks({
  matching: b => {
    if (!b || !b.position) return false;
    if (b.name === 'lava' || b.name === 'air' || b.name === 'cave_air') return false;
    return b.position.y >= 31;
  },
  maxDistance: 32,
  count: 30
});

console.log(`Found ${solidAboveLava.length} solid land blocks at y>=31:`);
for (const pos of solidAboveLava.slice(0, 15)) {
  const b = bot.blockAt(pos);
  const up = bot.blockAt(pos.offset(0, 1, 0));
  console.log(`  (${pos.x}, ${pos.y}, ${pos.z}): ${b.name}, up=${up?.name}, dist: ${pos.distanceTo(p).toFixed(1)}m`);
}
