// programs/015-track-team.js
const tm = lib.time();
console.log('Time of day:', tm.timeOfDay, 'phase:', tm.phase, 'canSleep:', tm.canSleep, 'night in:', tm.secondsUntilNight);

for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check portal site (298, 72, -54)
const portalFrame = [];
for (let y = 72; y <= 76; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b && b.name !== 'air') {
      portalFrame.push(`${x},${y}: ${b.name}`);
    }
  }
}
console.log('Portal blocks placed:\n' + portalFrame.join(', '));

if (tm.canSleep) {
  console.log('Night/sleep time reached! Attempting to sleep in bed...');
  try {
    await lib.sleepInBed();
    console.log('Sleeping in bed!');
  } catch (e) {
    console.log('Sleep in bed result/error:', e.message);
  }
}
