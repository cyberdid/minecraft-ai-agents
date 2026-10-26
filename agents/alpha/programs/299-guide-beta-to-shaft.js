// programs/299-guide-beta-to-shaft.js
console.log('=== Program 299: Guide Beta to Main Shaft ===');

// Send coordinates of main mine shaft to Beta
bot.chat('beta: Beta, the main mine shaft staircase is at (302, y, -44)! Head North ~46 blocks to z=-44 to take the clear stairs straight to base!');

// Also ask Delta/Gamma to sleep if night comes
bot.chat('team: Night is in ~90s. Delta and Gamma, please sleep in beds to skip night when 12542 arrives!');

// Wait 10s and monitor Beta's position
for (let i = 0; i < 5; i++) {
  if (isCancelled()) break;
  const b = bot.players.beta?.entity;
  if (b) {
    console.log(`[t=${i*2}s] Beta at ${lib.fmt(b.position)}, held=${b.heldItem?.name}`);
  }
  await sleep(2000);
}
