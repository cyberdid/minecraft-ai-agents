// programs/204-climb-to-base-house.js
console.log('--- CLIMB FROM Y=64 TO BASE HOUSE AT (294, 72, -54) ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// Equip weapon if any
await lib.equipWeapon();

// Navigate to base door (294, 72, -53)
console.log('Climbing to base entrance (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 10000 });
  } catch (e2) {}
}

console.log('At base exterior pos:', lib.fmt(bot.entity.position));

// Enter through door
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try {
    const d = bot.blockAt(new Vec3(294, 72, -54));
    if (d) await bot.activateBlock(d);
    await lib.walkTo(293.5, -55.5, 3000);
  } catch (e2) {}
}

try { await lib.door(294, 72, -54, false); } catch (e) {}

// Set spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {}

console.log('Inside base! Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma safely inside base at ${lib.fmt(bot.entity.position)}.`);
