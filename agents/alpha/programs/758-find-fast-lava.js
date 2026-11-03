// programs/758-find-fast-lava.js
console.log('=== Program 758: Find Lava Sources Fast ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const lavaId = mcData.blocksByName.lava.id;
const lavas = bot.findBlocks({
  matching: lavaId,
  maxDistance: 64,
  count: 100
});

console.log(`Lava blocks within 64m: ${lavas.length}`);

// Group and find sources (level 0)
const sources = [];
for (const p of lavas) {
  const b = bot.blockAt(p);
  const props = b.getProperties();
  if (props.level === '0' || props.level === 0 || (!props.level && b.metadata === 0)) {
    sources.push({ pos: p, above: bot.blockAt(p.offset(0, 1, 0))?.name });
  }
}

console.log(`Lava SOURCE blocks (level 0) found: ${sources.length}`);
for (const s of sources.slice(0, 15)) {
  console.log(` - Source at: ${lib.fmt(s.pos)}, above: ${s.above}, dist: ${bot.entity.position.distanceTo(s.pos).toFixed(1)}m`);
}

return {
  totalLava: lavas.length,
  sourcesCount: sources.length,
  firstSource: sources[0] || null
};
