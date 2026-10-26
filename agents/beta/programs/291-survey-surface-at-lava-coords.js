// programs/291-survey-surface-at-lava-coords.js
console.log('=== Step 47: Ascend to surface and walk to (285, 7) above lava lake ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Ascend to surface at (345, 65, -40)
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 30000, dig: true });
  console.log('Surface reached at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent note:', e.message);
  // Alternative: climb to base
  await lib.goTo(294, 72, -53, 2, { timeoutMs: 30000, dig: true });
}

// 2. Walk on surface to (285, 7)
console.log('Walking on surface to (285, 7)...');
try {
  await lib.goToXZ(285, 7, { timeoutMs: 30000 });
} catch (e) {
  console.log('Surface walk note:', e.message);
}
console.log('At surface above lava lake! Pos:', lib.fmt(bot.entity.position));

// 3. Scan for cave openings or exposed lava
const surfaceLava = bot.findBlocks({
  matching: b => b && b.name === 'lava',
  maxDistance: 64,
  count: 50
});
console.log(`Lava blocks found within 64 of (285, 7): ${surfaceLava.length}`);
if (surfaceLava.length > 0) {
  console.log('Nearest 5 lava blocks:\n' + surfaceLava.slice(0, 5).map(p => `${lib.fmt(p)} dist=${p.distanceTo(bot.entity.position).toFixed(1)}`).join('\n'));
}

// 4. Check ground block and see if there is a hole/shaft at (285, 7)
for (let dx = -4; dx <= 4; dx += 2) {
  for (let dz = -4; dz <= 4; dz += 2) {
    const p = bot.entity.position.offset(dx, 0, dz).floored();
    const b = bot.blockAt(p);
    const below = bot.blockAt(p.offset(0, -1, 0));
    if (b && (b.name === 'air' || b.name === 'cave_air') && below && (below.name === 'air' || below.name === 'cave_air')) {
      console.log(`Cave opening found at ${lib.fmt(p)}!`);
    }
  }
}

console.log('Beta inventory:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: At (285, 7) above lava lake. Lava blocks in 64: ${surfaceLava.length}. Scanning descent route.`);
