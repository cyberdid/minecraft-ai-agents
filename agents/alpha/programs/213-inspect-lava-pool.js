// programs/213-inspect-lava-pool.js
console.log('=== Program 213: Inspect Lava Pool at (333, 62, -78) ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// Scan for any lava within 32 blocks
const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 32, count: 50 });
console.log(`Found ${lavas.length} lava blocks within 32 blocks:`);
for (const p of lavas) {
  const blk = bot.blockAt(p);
  const up = bot.blockAt(p.offset(0, 1, 0));
  console.log(`  Lava at ${lib.fmt(p)}: metadata=${blk.metadata} (isSource=${blk.metadata===0}), up=${up?.name}`);
}

// Scan for obsidian within 32 blocks
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 32, count: 50 });
console.log(`Found ${obs.length} obsidian blocks within 32 blocks:`);
for (const p of obs) {
  console.log(`  Obsidian at ${lib.fmt(p)}`);
}

// Check grid around (333, 62, -78)
console.log('--- Block grid at y=62 and y=63 ---');
for (let z = -80; z <= -76; z++) {
  let row62 = `z=${z}: `;
  let row63 = `z=${z}: `;
  for (let x = 331; x <= 336; x++) {
    const b62 = bot.blockAt(new Vec3(x, 62, z));
    const b63 = bot.blockAt(new Vec3(x, 63, z));
    row62 += `${b62?.name}(${b62?.metadata}) `.padEnd(16);
    row63 += `${b63?.name} `.padEnd(16);
  }
  console.log(`[y=62] ${row62}`);
  console.log(`[y=63] ${row63}`);
}

// Check Beta position and held item
if (bot.players.beta) {
  const bEnt = bot.players.beta.entity;
  console.log('Beta pos:', bEnt ? lib.fmt(bEnt.position) : 'unknown', 'held:', bEnt?.heldItem?.name);
}
