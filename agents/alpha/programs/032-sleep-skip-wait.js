// programs/032-sleep-skip-wait.js
// Get in bed and let the server naturally advance to morning (no manual wake!)

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

try {
  await lib.sleepInBed();
  console.log('Alpha is in bed');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Loop until timeOfDay resets to day (ticks < 1000)
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay < 1000 || (!t.night && t.timeOfDay < 12000)) {
    console.log(`Day arrived! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(2000);
}

bot.chat('alpha: Day 4 dawn! Morning arrived.');

const finalTime = lib.time();
console.log('Final time:', finalTime);

return { time: finalTime };
