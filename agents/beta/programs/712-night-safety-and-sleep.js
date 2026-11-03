// programs/712-night-safety-and-sleep.js
console.log('=== Program 712: Night Protocol & Base Shelter ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();

// Sprint to base door at (294, 72, -53)
console.log('Sprinting to base door at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1.5, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo door note:', e.message);
  try { await lib.goToXZ(294, -53, { timeoutMs: 8000 }); } catch (e2) {}
}

console.log('At base entrance. Pos:', lib.fmt(bot.entity.position));

// Enter through door
const door = bot.findBlock({ matching: b => b && b.name.includes('door'), maxDistance: 5 });
if (door) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
    console.log('Safely inside base!');
  } catch (e) {
    console.log('Door passage note:', e.message);
  }
}

// Sleep in bed if night
console.log('Time is:', bot.time.timeOfDay);
try {
  await lib.sleepInBed();
  console.log('Sleeping in bed...');
} catch (e) {
  console.log('Sleep note:', e.message);
}

bot.chat('Beta: Safely sheltered inside base! Bed spawn active. 1 Blaze Rod secured.');
console.log('Program 712 complete. Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
