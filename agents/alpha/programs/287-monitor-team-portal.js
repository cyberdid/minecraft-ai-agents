// programs/287-monitor-team-portal.js
console.log('=== Program 287: Monitor Team & Portal ===');

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

// Check portal frame
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal missing at (298, 72, -54):', JSON.stringify(mat.missing));
