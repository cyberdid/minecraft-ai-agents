// programs/231-check-shaft-descent.js
console.log('=== INSPECT SHAFT DESCENT & COAL ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Inspect coal at (293, 66, -43)
const coalBlock = bot.blockAt(new Vec3(293, 66, -43));
console.log('Coal block at (293, 66, -43):', coalBlock?.name);

// 2. Check blocks in shaft downwards from y=71 down to y=46 at x=301..303, z=-44..-52
console.log('\n--- SHAFT BLOCKS ---');
for (let y = 71; y >= 46; y--) {
  let foundAir = [];
  for (let x = 300; x <= 303; x++) {
    for (let z = -52; z <= -44; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name === 'air') foundAir.push(`(${x}, ${y}, ${z})`);
    }
  }
  if (foundAir.length > 0) {
    console.log(`y=${y}: air at ${foundAir.slice(0, 3).join(', ')} (count: ${foundAir.length})`);
  }
}

// 3. Check players
for (const p of Object.values(bot.players)) {
  const ent = p.entity;
  console.log(`${p.username}: ${ent ? `${lib.fmt(ent.position)} held=${ent.heldItem?.name || 'none'}` : 'far/other dim'}`);
}
