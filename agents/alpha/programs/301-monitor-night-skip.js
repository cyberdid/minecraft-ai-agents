// programs/301-monitor-night-skip.js
console.log('=== Program 301: Monitor Night Skip ===');

for (let i = 0; i < 10; i++) {
  if (isCancelled()) break;
  const time = lib.time();
  const d = bot.players.delta?.entity;
  const g = bot.players.gamma?.entity;
  const b = bot.players.beta?.entity;
  console.log(`[t=${i*2}s] time=${time.timeOfDay} (${time.phase}) | night=${time.night} | canSleep=${time.canSleep}`);
  if (time.timeOfDay >= 23500 || time.timeOfDay < 12000) {
    console.log('NIGHT SKIPPED! Day has begun!');
    break;
  }
  await sleep(2000);
}
