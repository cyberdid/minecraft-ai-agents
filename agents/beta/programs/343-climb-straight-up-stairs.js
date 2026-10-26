// programs/343-climb-straight-up-stairs.js
console.log('=== Climb back-and-forth stairs to surface ===');

// Check time
console.log('Time left until night:', lib.time().secondsUntilNight);

const waypoints = [
  [303, 22, -48],
  [303, 24, -47],
  [303, 26, -45],
  [303, 30, -44],
  [303, 38, -44],
  [303, 48, -43],
  [303, 58, -43],
  [302, 71, -44]
];

for (const [x, y, z] of waypoints) {
  try {
    await lib.goTo(x, y, z, 2, { timeoutMs: 12000 });
    console.log(`Reached (${x}, ${y}, ${z})! Pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Step to (${x}, ${y}, ${z}) note:`, e.message);
  }
}

// Enter base door
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base with team!');
  bot.chat('beta: Reunited with team at base! Milestone 7 complete!');
} catch (e) {
  console.log('Base entry note:', e.message);
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
