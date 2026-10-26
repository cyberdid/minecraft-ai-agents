// programs/093-staircase-up-to-base.js
console.log('--- SYSTEMATIC STAIRCASE UP TO BASE ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));

await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');

// Ascend step by step towards x=294, y=72, z=-54
for (let step = 0; step < 26 && bot.entity.position.y < 71 && !isCancelled(); step++) {
  const p = bot.entity.position.floored();
  
  // Decide direction: move towards x=294 (dx = -1) and z=-54 (dz = -1 if z > -54)
  const dx = -1;
  const dz = (p.z > -54) ? -1 : 0;
  const targetX = p.x + dx;
  const targetY = p.y + 1;
  const targetZ = p.z + dz;

  // Clear 3 blocks ahead/above for walking clearance
  const clearBlocks = [
    new Vec3(targetX, targetY, targetZ),
    new Vec3(targetX, targetY + 1, targetZ),
    new Vec3(targetX, targetY + 2, targetZ),
    new Vec3(p.x, p.y + 2, p.z) // head clearance above current spot
  ];

  for (const cb of clearBlocks) {
    const b = bot.blockAt(cb);
    if (b && b.boundingBox === 'block') {
      try {
        await lib.dig(cb.x, cb.y, cb.z);
        await sleep(50);
      } catch (e) {}
    }
  }

  // Step up onto the new step
  await bot.lookAt(new Vec3(targetX + 0.5, targetY + 1.6, targetZ + 0.5));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(350);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  await sleep(150);

  console.log(`Step ${step + 1}: pos is now ${lib.fmt(bot.entity.position)}`);
}

console.log('Ascent finished. Final pos:', lib.fmt(bot.entity.position));

// If on surface, walk to base door (294, 72, -54)
if (bot.entity.position.y >= 70) {
  console.log('SURFACE REACHED! Navigating to base door...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
    console.log('At base door! Entering...');
    await lib.goThroughDoor(294, 72, -54);
    console.log('INSIDE BASE SHELTER!');
  } catch (e) {
    console.log('Base door walk note:', e.message);
  }
}

bot.chat(`gamma status: pos=${lib.fmt(bot.entity.position)}, health=${bot.health}, food=${bot.food}`);
