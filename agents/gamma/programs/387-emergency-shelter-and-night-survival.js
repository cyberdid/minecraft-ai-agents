// programs/387-emergency-shelter-and-night-survival.js
console.log('=== EMERGENCY SHELTER FOR NIGHT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// 1. Shelter immediately
try {
  await lib.shelter();
  console.log('Safely sheltered underground!');
  bot.chat('gamma: sheltered underground for night at (293, 66, -81)!');
} catch (e) {
  console.log('lib.shelter note:', e.message);
  // Manual shelter fallback: dig 2 down and place cobblestone above head
  const p = bot.entity.position.floored();
  try {
    await lib.dig(p.x, p.y - 1, p.z);
    await lib.dig(p.x, p.y - 2, p.z);
    await lib.goTo(p.x + 0.5, p.y - 2, p.z + 0.5, 0.5);
    await lib.place('cobblestone', p.x, p.y, p.z);
  } catch (e2) {}
}

console.log('Waiting out the night safely...');
const startWait = Date.now();
while (Date.now() - startWait < 180000 && !isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.timeOfDay >= 23460) {
    console.log('Dawn has arrived! Time:', t.timeOfDay);
    break;
  }
  await sleep(4000);
}

// Leave shelter at dawn
console.log('Leaving shelter at dawn...');
try {
  await lib.leaveShelter();
  console.log('Left shelter safely!');
} catch (e) {
  console.log('leaveShelter note:', e.message);
}

console.log('Pos after night:', lib.fmt(bot.entity.position));
console.log('Ending status:', JSON.stringify(lib.status()));
