// programs/277-inspect-safety.js
console.log('=== Program 277: Night Safety & Status ===');
console.log('Time:', lib.time());
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);

// Check hostiles
const hostiles = lib.hostiles(16);
console.log(`Hostiles in 16m: ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`);
}

// Check if any hostile has path to bot
// If bot is safe in pocket, wait 10s and monitor team chat
for (let i = 0; i < 5; i++) {
  if (isCancelled()) break;
  for (const name of ['beta', 'delta', 'gamma']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`[t=${i*2}s] ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
    }
  }
  await sleep(2000);
}
