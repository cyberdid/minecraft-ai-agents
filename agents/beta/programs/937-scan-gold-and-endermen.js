console.log('=== Program 937: Detailed Scan of Nether Gold Ore ===');
globalThis.isProgramCancelled = isCancelled;

const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 48,
  count: 64
});

console.log(`Total gold ores found in 48m: ${ores.length}`);
const sorted = ores.map(p => {
  const b = bot.blockAt(p);
  return {
    name: b.name,
    pos: p,
    dist: bot.entity.position.distanceTo(p),
    dx: p.x - bot.entity.position.x,
    dy: p.y - bot.entity.position.y,
    dz: p.z - bot.entity.position.z
  };
}).sort((a, b) => a.dist - b.dist);

for (const o of sorted.slice(0, 20)) {
  console.log(`  ${o.name} at ${lib.fmt(o.pos)}: dist=${o.dist.toFixed(1)}m (dx=${o.dx.toFixed(1)}, dy=${o.dy.toFixed(1)}, dz=${o.dz.toFixed(1)})`);
}

// Check if any ore is within 6 blocks of our current path / tunnel / bunker
const closeOres = sorted.filter(o => Math.abs(o.dy) <= 3 && o.dist <= 10);
console.log(`Close ores (dy <= 3, dist <= 10): ${closeOres.length}`);
for (const co of closeOres) {
  console.log(`  CLOSE: ${co.name} at ${lib.fmt(co.pos)}`);
}

// Also check Endermen within 64m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 64
);
console.log(`Endermen within 64m: ${endermen.length}`);
for (const em of endermen) {
  console.log(`  Enderman at ${lib.fmt(em.position)}, dist=${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

return {
  totalOres: ores.length,
  closest: sorted.slice(0, 5),
  endermen: endermen.map(e => ({ pos: lib.fmt(e.position), dist: bot.entity.position.distanceTo(e.position).toFixed(1) }))
};
