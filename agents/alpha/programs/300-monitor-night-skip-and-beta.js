// programs/300-monitor-night-skip-and-beta.js
console.log('=== Program 300: Monitor Night Skip & Beta Ascent ===');

for (let i = 0; i < 10; i++) {
  if (isCancelled()) break;
  const time = lib.time();
  const b = bot.players.beta?.entity;
  const d = bot.players.delta?.entity;
  const g = bot.players.gamma?.entity;
  
  console.log(`[t=${i*2}s] time=${time.timeOfDay} (${time.phase}) | Beta: ${b ? lib.fmt(b.position) : 'offline'} | Delta: ${d ? lib.fmt(d.position) : 'offline'}`);
  await sleep(2000);
}
