// programs/312-step-west-and-respawn.js
console.log('=== Program 312: Step West into Drop to Respawn at Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health);

// Look West and step forward
await bot.lookAt(new Vec3(333.5, 17.0, -70.0));
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

console.log('Stepped West! Waiting for respawn at base...');

// Wait up to 10s for respawn
for (let i = 0; i < 10; i++) {
  if (bot.health >= 18) {
    console.log('RESPAWNED AT BASE! Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
    break;
  }
  console.log(`[t=${i}s] Pos: ${lib.fmt(bot.entity.position)}, Health: ${bot.health}`);
  await sleep(1000);
}

// If at base, enter base and grab tools/food
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
