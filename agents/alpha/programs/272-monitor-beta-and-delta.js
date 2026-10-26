// programs/272-monitor-beta-and-delta.js
console.log('=== Program 272: Monitor Beta & Delta ===');
for (let i = 0; i < 6; i++) {
  if (isCancelled()) break;
  for (const name of ['beta', 'gamma', 'delta']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`[t=${i*2}s] ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
    }
  }
  await sleep(2000);
}
