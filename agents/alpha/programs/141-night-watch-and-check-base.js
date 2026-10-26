// programs/141-night-watch-and-check-base.js
console.log('--- Night Watch & Base Safety Check ---');

// 1. Check door
const door = bot.blockAt(new Vec3(294, 72, -54));
console.log(`Door at (294, 72, -54): ${door?.name}, open: ${door?.getProperties()?.open}`);
if (door && door.getProperties()?.open) {
  await lib.door(294, 72, -54, false);
  console.log('Closed door.');
}

// 2. Check torches inside base (292..296, 72..74, -58..-54)
const torches = bot.findBlocks({ matching: b => b.name.includes('torch'), maxDistance: 10 });
console.log('Torches nearby:', torches.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// 3. Check Beta's state
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, heldItem: ${p.entity.heldItem?.name}`);
  }
}

// 4. Send team message
bot.chat('beta, staying in base till dawn. At dawn: we need iron for your boots & my shield/bucket, 2 wool for 2nd bed, then obsidian.');

// 5. Check time and hostiles outside
const st = lib.status();
console.log('Time:', st.timeOfDay, '| Phase:', st.phase, '| Hostiles:', JSON.stringify(st.hostiles));
