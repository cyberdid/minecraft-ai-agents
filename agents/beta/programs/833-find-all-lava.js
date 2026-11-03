// programs/833-find-all-lava.js
console.log('=== Program 833: Scan All Lava within 32m ===');
const p = bot.entity.position;
console.log(`Bot pos: ${lib.fmt(p)}`);

const allLava = bot.findBlocks({
  matching: b => b && (b.name === 'lava' || b.name === 'flowing_lava'),
  maxDistance: 32,
  count: 20
});

console.log(`Found ${allLava.length} lava blocks:`, allLava.map(l => {
  const b = bot.blockAt(l);
  return `${lib.fmt(l)}: ${b.name} (meta:${b.metadata}) dist=${p.distanceTo(l).toFixed(1)}`;
}));
