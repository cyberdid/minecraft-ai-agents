// programs/414-sleep-through-night-to-dawn.js
console.log('=== Program 414: Seal Wall, Sleep Through Night to Dawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'canSleep:', lib.time().canSleep);

// 1. Seal any open gap at (293, 72, -54) with cobblestone
const gapLower = bot.blockAt(new Vec3(293, 72, -54));
const gapUpper = bot.blockAt(new Vec3(293, 73, -54));
console.log('Gap lower:', gapLower?.name, 'upper:', gapUpper?.name);

if (gapLower && gapLower.name === 'air') {
  console.log('Sealing gap lower at (293, 72, -54)...');
  try {
    await lib.place('cobblestone', 293, 72, -54);
  } catch (e) {
    console.log('Seal lower note:', e.message);
  }
}
if (gapUpper && gapUpper.name === 'air') {
  console.log('Sealing gap upper at (293, 73, -54)...');
  try {
    await lib.place('cobblestone', 293, 73, -54);
  } catch (e) {
    console.log('Seal upper note:', e.message);
  }
}

// 2. Chat with Beta and Gamma
bot.chat('team: Alpha in Bed 1! Base walls sealed. Beta & Gamma please sleep in beds to skip night to dawn!');

// 3. Sleep in Bed 1
if (lib.time().canSleep) {
  try {
    console.log('Entering bed...');
    await lib.sleepInBed();
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// 4. Stay in bed / sheltered until dawn (time < 1000 or > 23460)
console.log('Waiting for dawn...');
const dawnDeadline = Date.now() + 60000;
while (Date.now() < dawnDeadline && !isCancelled()) {
  const t = bot.time.timeOfDay;
  if (t < 1000 || t >= 23460) {
    console.log(`*** DAWN REACHED! Time=${t} ***`);
    break;
  }
  // If not sleeping and can sleep, retry sleep
  if (!bot.isSleeping && lib.time().canSleep) {
    try { await lib.sleepInBed(); } catch (err) {}
  }
  await sleep(1000);
}

// 5. If sleeping, wake up
if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Alpha morning status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha awake at dawn! Time=${bot.time.timeOfDay}, HP=${bot.health}, Food=${bot.food}.`);
