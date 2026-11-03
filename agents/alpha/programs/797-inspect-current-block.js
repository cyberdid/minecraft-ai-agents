// programs/797-inspect-current-block.js
const p = bot.entity.position;
console.log('Pos:', p);
const feet = bot.blockAt(p);
const below = bot.blockAt(p.offset(0, -1, 0));
console.log('Feet block:', feet ? feet.name : 'null');
console.log('Below block:', below ? below.name : 'null');

// Find all solid blocks within 10m
const solids = bot.findBlocks({
  matching: b => b && b.boundingBox === 'block' && b.name !== 'lava',
  maxDistance: 10,
  count: 20
});
console.log(`Solid non-lava blocks nearby: ${solids.length}`);
for (const s of solids.slice(0, 10)) {
  const b = bot.blockAt(s);
  console.log(`- ${b.name} at ${lib.fmt(s)} (dist=${p.distanceTo(s).toFixed(1)})`);
}
