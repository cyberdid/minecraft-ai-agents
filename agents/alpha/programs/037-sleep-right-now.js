// programs/037-sleep-right-now.js
// Get into bed while beta is sleeping so night skips immediately

console.log('alpha pos:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

const beds = lib.find('*_bed', { maxDistance: 5, count: 5 });
console.log('Beds nearby:', beds.length);

for (const bed of beds) {
  try {
    console.log(`Attempting to sleep in bed at ${lib.fmt(bed.position)}...`);
    const bedBlock = bot.blockAt(bed.position);
    await bot.sleep(bedBlock);
    console.log('Successfully sleeping in bed!');
    break;
  } catch (e) {
    console.log(`Bed sleep note at ${lib.fmt(bed.position)}:`, e.message);
  }
}

// Wait until morning
for (let i = 0; i < 20; i++) {
  await sleep(1000);
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Morning reached! Day 5! timeOfDay: ${t.timeOfDay}`);
    break;
  }
}

try {
  await bot.wake();
} catch (e) {}

const finalTime = lib.time();
console.log('Final time:', finalTime);
bot.chat('alpha: Day 5 morning! Night skipped.');

return { time: finalTime };
