// programs/300-retreat-to-base.js
console.log('=== RETREAT TO BASE ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Equip sword
await lib.equipWeapon();

// Check hostiles
const hostiles = lib.hostiles(16);
console.log('Hostiles:', JSON.stringify(hostiles));

// Move towards base entrance at (294, 72, -53)
console.log('Walking to base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Entered base successfully!');
} catch (e) {
  console.log('Base entry note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

console.log('Now at:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
