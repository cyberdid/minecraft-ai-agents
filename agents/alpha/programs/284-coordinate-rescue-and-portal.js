// programs/284-coordinate-rescue-and-portal.js
console.log('=== Program 284: Coordinate Beta Location & Check Movement ===');
const b = bot.players.beta?.entity;
const g = bot.players.gamma?.entity;
const d = bot.players.delta?.entity;

console.log('Beta pos:', b ? lib.fmt(b.position) : 'unknown', 'held:', b?.heldItem?.name);
console.log('Gamma pos:', g ? lib.fmt(g.position) : 'unknown');
console.log('Delta pos:', d ? lib.fmt(d.position) : 'unknown');

// Chat coordinates clearly to team
bot.chat('team: Beta is at (297, 39, 2), which is 46 blocks South of the mine shaft! Gamma/Delta, check near (297, 72, 2) on the surface!');

// Also ask Beta directly
bot.chat('beta: Beta, what is your status at (297, 39, 2)? Do you need a path or help to reach surface?');

// Wait 5 seconds to observe any movement or replies
for (let i = 0; i < 5; i++) {
  if (isCancelled()) break;
  const currB = bot.players.beta?.entity;
  if (currB) {
    console.log(`[t=${i}s] Beta at ${lib.fmt(currB.position)}`);
  }
  await sleep(1000);
}
