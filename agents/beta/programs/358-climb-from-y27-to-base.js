// programs/358-climb-from-y27-to-base.js
console.log('=== Climb from y=27 to surface base ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const waypoints = [
  [304, 30, -42],
  [303, 34, -43],
  [303, 42, -40],
  [303, 50, -38],
  [303, 60, -37],
  [302, 71, -42]
];

for (const [x, y, z] of waypoints) {
  try {
    await lib.goTo(x, y, z, 2, { timeoutMs: 15000 });
    console.log(`Reached (${x}, ${y}, ${z}) -> pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Step (${x}, ${y}, ${z}) note:`, e.message);
  }
}

// Enter base door
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base with team!');
  bot.chat('beta: Reached base safely! Milestone 7 complete! Joining East hill iron gathering!');
} catch (e) {
  console.log('Base note:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
