// programs/849-find-open-lava.js
console.log('=== Program 849: Find Open Lava without Water Above ===');
const p = bot.entity.position;

const allLava = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 32,
  count: 50
});

console.log(`Found ${allLava.length} total lava sources within 32m:`);

const openLava = [];
for (const lp of allLava) {
  const up = bot.blockAt(lp.offset(0, 1, 0));
  if (up && up.name !== 'water' && up.name !== 'flowing_water' && up.name !== 'obsidian') {
    openLava.push({ pos: lp, upName: up.name, dist: p.distanceTo(lp) });
  }
}

console.log(`Found ${openLava.length} open lava sources (no water/obsidian above):`);
for (const ol of openLava.slice(0, 10)) {
  console.log(`  Lava at ${lib.fmt(ol.pos)} (above: ${ol.upName}, dist: ${ol.dist.toFixed(1)}m)`);
}
