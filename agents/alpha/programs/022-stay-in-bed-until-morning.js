// programs/022-stay-in-bed-until-morning.js
// Sleep in bed and keep sleeping until morning ticks over to Day 3

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

try {
  await lib.sleepInBed();
  console.log('Sleeping in bed...');
} catch (e) {
  console.log('Sleep error:', e.message);
}

// Wait until morning (timeOfDay resets to ~0 or day phase)
while (!isCancelled()) {
  const t = lib.time();
  if (!t.night && t.timeOfDay < 12000) {
    console.log(`Morning achieved! Day 3 has started! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(1000);
}

bot.chat('alpha: Day 3 morning! Night skipped. Time to mine iron on the hills.');

const finalTime = lib.time();
console.log('Final time:', finalTime);

return { time: finalTime };
