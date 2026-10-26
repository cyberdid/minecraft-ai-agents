// programs/443-shelter-base-and-sleep.js
console.log('=== Program 443: Shelter from Creeper, Enter Base & Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Move into base door (294, 72, -54) avoiding creeper
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1); } catch (e2) {}
}

// Ensure door is closed
try { await lib.door(294, 72, -54, false); } catch (e) {}

console.log('Alpha position inside base:', lib.fmt(bot.entity.position));

// 2. Chat with Beta
bot.chat('team: Alpha inside base with Beta! Dusk approaching. Let us sleep in base beds at 12542 to skip night safely.');

// 3. Move near Bed 1 (294, 72, -55)
try { await lib.goNearBlock(294, 72, -55); } catch (e) {}

// 4. Wait for sleep time (12542)
console.log('Waiting for sleep time (12542)... Current time:', lib.time().timeOfDay);
while (lib.time().timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 5. Sleep in bed
if (!isCancelled() && lib.time().canSleep) {
  console.log('Calling lib.sleepInBed()...');
  try {
    await lib.sleepInBed();
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      if (!bot.isSleeping) break;
    }
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Alpha status after night:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha awake at dawn! Time=${bot.time.timeOfDay}, HP=${bot.health}, Food=${bot.food}.`);
