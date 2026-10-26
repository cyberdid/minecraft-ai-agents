// programs/314-step-into-chasm.js
console.log('=== Program 314: Step into Chasm to Respawn at Base ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);

// Look East (+X) and step forward into the 10-block drop
await bot.lookAt(new Vec3(334.5, 15.0, -70.0));
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

console.log('Stepped into chasm! Waiting for respawn at base...');

// Wait up to 10s for respawn
for (let i = 0; i < 10; i++) {
  if (bot.health >= 18) {
    console.log('RESPAWNED AT BASE! Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
    break;
  }
  console.log(`[t=${i}s] Pos: ${lib.fmt(bot.entity.position)}, Health: ${bot.health}`);
  await sleep(1000);
}

// Enter base immediately if near
if (bot.entity.position.distanceTo(new Vec3(294, 72, -55)) < 30) {
  console.log('Entering base...');
  try {
    await lib.goTo(294, 72, -54, 2, { timeoutMs: 10000 });
    await lib.goThroughDoor(294, 72, -54);
    await lib.door(294, 72, -54, false).catch(() => {});
    console.log('Safely inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Base entry note:', e.message);
  }
}
