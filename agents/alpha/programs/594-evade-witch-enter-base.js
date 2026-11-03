// programs/594-evade-witch-enter-base.js
console.log('=== Program 594: Evade Witch & Enter Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Hostiles check
const hostiles = lib.hostiles(20);
console.log('Hostiles nearby:', hostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

// 1. Sprint Southeast towards base door (294, 72, -54)
const targetDoor = new Vec3(294, 72, -54);
console.log(`Sprinting away from hostiles towards base door at ${lib.fmt(targetDoor)}...`);

for (let attempt = 0; attempt < 3; attempt++) {
  if (bot.entity.position.distanceTo(targetDoor) < 2.5) break;
  try {
    await lib.goTo(targetDoor.x, targetDoor.y, targetDoor.z, 2, { timeoutMs: 8000 });
  } catch (e) {
    console.log(`goTo attempt ${attempt + 1} note: ${e.message}`);
    await bot.lookAt(new Vec3(targetDoor.x, targetDoor.y + 1.0, targetDoor.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

console.log('Near base door! Pos:', lib.fmt(bot.entity.position));

// 2. Go through door into base
console.log('Entering base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(293.5, 72.0, -56.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('Door manual passage note:', e2.message);
  }
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));

// 3. Lock spawn point at base bed
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('Spawn set successfully!');
  bot.chat('alpha: Safe inside base, spawn point locked at bed!');
} catch (se) {
  console.log('setSpawn note:', se.message);
}

// 4. Inspect teammates and inventory
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}
console.log('Alpha inventory:', lib.inv());
console.log('Time:', lib.time());
