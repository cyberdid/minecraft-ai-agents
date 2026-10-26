// programs/341-return-to-base-before-night.js
console.log('=== Program 341: Return to Base Before Night ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time());

// Long journey back to base across surface
console.log('Navigating back to base (294, 72, -54)...');
bot.chat('team: Alpha returning to base from (465, 65, -227) before nightfall!');

try {
  await lib.goToXZ(294, -54);
  console.log('Near base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goToXZ note:', e.message);
}

// Enter through door
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 20000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e2) {
  console.log('Door note:', e2.message);
  // Emergency shelter if night falls before entering
  const t = lib.time();
  if (t.secondsUntilNight < 30 || t.night) {
    console.log('Night is here, sheltering safely...');
    await lib.shelter();
  }
}

console.log('Status at end of program:', JSON.stringify(lib.status()));
