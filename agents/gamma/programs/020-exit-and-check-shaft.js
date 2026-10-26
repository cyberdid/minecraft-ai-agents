// programs/020-exit-and-check-shaft.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Go through door without forcing close if it glitches
try {
  const r = await lib.goThroughDoor(294, 72, -54, { close: false });
  console.log('goThroughDoor:', r);
} catch (e) {
  console.log('goThroughDoor error, trying manual walk:', e.message);
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

console.log('Now at:', lib.fmt(bot.entity.position));

// Go to shaft entrance at (302, 71, -44)
await lib.goTo(302, 71, -44, 1);
console.log('At shaft entrance:', lib.fmt(bot.entity.position));

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat('gamma at main mine shaft (302, 71, -44). Checking shaft...');
