// programs/320-monitor-shaft-ascent.js
console.log('=== Program 320: Monitor Shaft Ascent ===');

for (let i = 0; i < 5; i++) {
  if (isCancelled()) break;
  for (const name of ['delta', 'beta', 'gamma']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`[t=${i*2}s] ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
    }
  }
  await sleep(2000);
}
