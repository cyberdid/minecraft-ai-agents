// programs/310-break-and-fall.js
console.log('=== Program 310: Break Cobblestone & Return to Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'hp:', bot.health);

// Break cobblestone at (335, 22, -70)
const b1 = bot.blockAt(new Vec3(335, 22, -70));
if (b1) {
  console.log(`Digging ${b1.name} at (335, 22, -70)...`);
  await bot.dig(b1);
  console.log('Broken block 1!');
}

// Break cobblestone at (335, 21, -70)
const b2 = bot.blockAt(new Vec3(335, 21, -70));
if (b2) {
  console.log(`Digging ${b2.name} at (335, 21, -70)...`);
  await bot.dig(b2);
  console.log('Broken block 2!');
}

// Now step into the drop at (335, 21, -70)
console.log('Stepping into drop...');
await bot.lookAt(new Vec3(335.5, 21.0, -69.5));
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

// Wait for respawn
for (let i = 0; i < 10; i++) {
  if (bot.health >= 18) {
    console.log('RESPAWNED AT BASE! Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
    break;
  }
  console.log(`[t=${i}s] Pos: ${lib.fmt(bot.entity.position)}, Health: ${bot.health}`);
  await sleep(1000);
}

// Enter base if near
if (bot.entity.position.distanceTo(new Vec3(294, 72, -55)) < 30) {
  console.log('Navigating to base door...');
  try {
    await lib.goTo(294, 72, -54, 2, { timeoutMs: 10000 });
    await lib.goThroughDoor(294, 72, -54);
    await lib.door(294, 72, -54, false).catch(() => {});
    console.log('Safely inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Base entry note:', e.message);
  }
}
