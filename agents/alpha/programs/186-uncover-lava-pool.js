// programs/186-uncover-lava-pool.js
console.log('--- Uncovering Lava Pool ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Dig dirt blocks at y=63 over the lava
const dirtTargets = [
  new Vec3(333, 63, -78),
  new Vec3(334, 63, -78),
  new Vec3(332, 63, -78),
  new Vec3(333, 63, -77),
  new Vec3(333, 63, -79),
  new Vec3(334, 63, -77),
  new Vec3(334, 63, -79)
];

for (const p of dirtTargets) {
  const blk = bot.blockAt(p);
  if (blk && blk.name !== 'air' && blk.name !== 'lava' && blk.name !== 'water') {
    console.log(`Digging ${blk.name} at ${lib.fmt(p)}...`);
    try {
      await bot.dig(blk);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// 2. Place a solid cobblestone block on the west edge at (331, 62, -78) if not solid
const edgeBlock = bot.blockAt(new Vec3(332, 62, -78));
console.log(`Edge block at (332, 62, -78): ${edgeBlock?.name}`);

// 3. Scan lava sources with air above
const openLava = bot.findBlocks({ matching: b => b.name === 'lava' && b.metadata === 0, maxDistance: 16 })
  .map(p => bot.blockAt(p))
  .filter(b => b && bot.blockAt(b.position.offset(0, 1, 0))?.name === 'air');

console.log(`Open lava sources with air above: ${openLava.length}`);
for (const l of openLava) {
  console.log(`  Open lava at ${lib.fmt(l.position)}`);
}

bot.chat(`beta: Lava pool uncovered! Open sources: ${openLava.length}. Run lib.makeObsidian(10) now!`);
