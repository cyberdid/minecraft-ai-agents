// programs/287-gather-wood-and-cobble.js
console.log('=== GATHER WOOD & COBBLESTONE ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Collect 8 logs from nearby trees using our stone axe
console.log('Collecting logs...');
try {
  const gotLogs = await lib.collect('*_log', 8);
  console.log('Gained logs:', JSON.stringify(gotLogs));
} catch (e) {
  console.log('collect logs note:', e.message);
}

console.log('Logs now:', lib.count('*_log'));

// 2. Mine cobblestone from surface stone (y >= 68) to stay safe above aquifer
console.log('Mining stone for cobblestone...');
const surfaceStone = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 24,
  count: 40
}).filter(p => p.y >= 68);

console.log(`Found ${surfaceStone.length} safe surface stone blocks (y >= 68)`);

let mined = 0;
for (const p of surfaceStone) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    const d = bot.entity.position.distanceTo(p);
    if (d > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 5000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    mined++;
  } catch (e) {
    // continue to next block
  }
}

await sleep(300);
await lib.pickup(8);
console.log(`Mined ${mined} stone blocks. Cobblestone now: ${lib.count('cobblestone')}`);

// 3. Status check
console.log('Inv:', JSON.stringify(lib.inv()));
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${t.secondsUntilNight}s`);
