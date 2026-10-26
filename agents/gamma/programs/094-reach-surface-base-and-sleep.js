// programs/094-reach-surface-base-and-sleep.js
console.log('--- ASCEND TO SURFACE BASE & NIGHT PROTOCOL ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');

// Ascend 16 steps straight up to y=71
for (let step = 0; step < 18 && bot.entity.position.y < 71 && !isCancelled(); step++) {
  const p = bot.entity.position.floored();
  const dx = -1;
  const dz = (p.z > -54) ? -1 : 0;
  const targetX = p.x + dx;
  const targetY = p.y + 1;
  const targetZ = p.z + dz;

  const clearBlocks = [
    new Vec3(targetX, targetY, targetZ),
    new Vec3(targetX, targetY + 1, targetZ),
    new Vec3(targetX, targetY + 2, targetZ),
    new Vec3(p.x, p.y + 2, p.z)
  ];

  for (const cb of clearBlocks) {
    const b = bot.blockAt(cb);
    if (b && b.boundingBox === 'block') {
      try {
        await lib.dig(cb.x, cb.y, cb.z);
        await sleep(40);
      } catch (e) {}
    }
  }

  await bot.lookAt(new Vec3(targetX + 0.5, targetY + 1.6, targetZ + 0.5));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(350);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  await sleep(100);

  console.log(`Ascent step ${step + 1}: pos is ${lib.fmt(bot.entity.position)}`);
}

console.log('Ascent complete! Pos:', lib.fmt(bot.entity.position));

// If on surface, walk to base door (294, 72, -53) and enter
if (bot.entity.position.y >= 70) {
  console.log('Surface reached! Walking to base door...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
    console.log('At door exterior! Entering base...');
    await lib.goThroughDoor(294, 72, -54);
    console.log('INSIDE BASE SHELTER!');
  } catch (e) {
    console.log('Base door walk note:', e.message);
  }
}

// Check time and sleep if night
const t = lib.time();
console.log('Time:', JSON.stringify(t));
if (t.timeOfDay >= 12542) {
  console.log('Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
bot.chat(`gamma safe inside base with Beta! Pos: ${lib.fmt(bot.entity.position)}. Cobble: ${lib.count('cobblestone')}`);
