// programs/335-listen-team-chat.js
console.log('=== Program 335: Listen to Team Chat ===');
for (let i = 0; i < 4; i++) {
  if (isCancelled()) break;
  for (const name of ['gamma', 'delta', 'beta']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`[t=${i}s] ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
    }
  }
  await sleep(1000);
}
