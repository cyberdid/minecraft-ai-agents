// programs/275-suffocate-respawn.js
console.log('=== Program 275: Suffocate & Respawn at Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);

// Try lib.place at head position (335, 24, -70)
try {
  await lib.place('cobblestone', 335, 24, -70);
  console.log('Placed cobblestone at head!');
} catch (e) {
  console.log('lib.place head note:', e.message);
  // Alternative: place at feet position (335, 23, -70)
  try {
    await lib.place('cobblestone', 335, 23, -70);
    console.log('Placed cobblestone at feet!');
  } catch (e2) {
    console.log('lib.place feet note:', e2.message);
  }
}

// Wait for health to drop or respawn
for (let i = 0; i < 15; i++) {
  if (bot.health >= 19) {
    console.log('RESPAWNED AT BASE! Pos:', lib.fmt(bot.entity.position));
    break;
  }
  console.log(`[t=${i}s] Health: ${bot.health.toFixed(1)}/20, pos: ${lib.fmt(bot.entity.position)}`);
  await sleep(1000);
}

// If respawned at base, enter base immediately (night is coming!)
if (bot.entity.position.distanceTo(new Vec3(294, 72, -55)) < 30) {
  console.log('Entering base...');
  try {
    await lib.goTo(294, 72, -54, 2, { timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
    await lib.door(294, 72, -54, false).catch(() => {});
    console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Enter base note:', e.message);
  }
}
