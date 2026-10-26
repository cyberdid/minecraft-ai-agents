// programs/187-find-all-lava-sources.js
const sources = bot.findBlocks({ matching: b => b.name === 'lava' && b.metadata === 0, maxDistance: 48, count: 50 });
console.log(`Found ${sources.length} lava source blocks within 48 blocks:`);
for (const p of sources) {
  const blk = bot.blockAt(p);
  const up = bot.blockAt(p.offset(0, 1, 0));
  console.log(`  Source at ${lib.fmt(p)}: up=${up?.name}`);
}

// Check where Beta is right now
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}
