// programs/214-scan-lava-and-check-base.js
console.log('=== Program 214: Scan Lava/Obsidian & Base State ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Column at (333, y, -78)
console.log('Column at (333, y, -78):');
for (let y = 65; y >= 50; y--) {
  const b = bot.blockAt(new Vec3(333, y, -78));
  if (b && b.name !== 'air') {
    console.log(`  y=${y}: ${b.name} (meta=${b.metadata})`);
  }
}

// 2. Scan all lava within 96 blocks
const allLava = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 96, count: 100 });
console.log(`Total lava blocks within 96 blocks: ${allLava.length}`);
const lavaSources = allLava.map(p => bot.blockAt(p)).filter(b => b && b.metadata === 0);
console.log(`Lava sources (metadata 0): ${lavaSources.length}`);
for (const s of lavaSources.slice(0, 10)) {
  const up = bot.blockAt(s.position.offset(0, 1, 0));
  console.log(`  Source at ${lib.fmt(s.position)}, up=${up?.name}`);
}

// 3. Scan all obsidian within 96 blocks
const allObs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 96, count: 50 });
console.log(`Total obsidian blocks within 96 blocks: ${allObs.length}`);
for (const o of allObs) {
  console.log(`  Obsidian at ${lib.fmt(o)}`);
}

// 4. Check base at (294, 72, -55)
const bed1 = bot.blockAt(new Vec3(294, 72, -55));
const bed2 = bot.blockAt(new Vec3(293, 72, -56));
console.log(`Base Bed 1 at (294, 72, -55): ${bed1?.name}`);
console.log(`Base Bed 2 at (293, 72, -56): ${bed2?.name}`);

// 5. Check portal site at (298, 72, -54)
console.log('Portal site blocks at (298..301, 72..76, -54):');
for (let dy = 0; dy <= 4; dy++) {
  let row = `y=${72+dy}: `;
  for (let dx = 0; dx <= 3; dx++) {
    const b = bot.blockAt(new Vec3(298 + dx, 72 + dy, -54));
    row += `${b?.name} `.padEnd(16);
  }
  console.log(`  ${row}`);
}

// Check Beta
if (bot.players.beta) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', b ? lib.fmt(b.position) : 'unknown', 'held:', b?.heldItem?.name);
}
