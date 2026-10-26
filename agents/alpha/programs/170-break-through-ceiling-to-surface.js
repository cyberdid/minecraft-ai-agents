// programs/170-break-through-ceiling-to-surface.js
console.log('--- Breaking Through Ceiling to Surface ---');
console.log('Pos before:', lib.fmt(bot.entity.position));

const p = bot.entity.position.floored();

// 1. Dig blocks above us from y=67 to y=70
for (let y = p.y + 3; y <= p.y + 7; y++) {
  const blkPos = new Vec3(p.x, y, p.z);
  const b = bot.blockAt(blkPos);
  if (b && b.name !== 'air' && b.boundingBox === 'block') {
    console.log(`Digging ${b.name} above at y=${y}...`);
    try {
      await lib.dig(blkPos.x, blkPos.y, blkPos.z);
    } catch (e) {
      console.log(`Dig error at y=${y}:`, e.message);
    }
  }
}

// 2. Tower up with cobblestone
console.log('Towering up to surface...');
for (let t = 0; t < 7; t++) {
  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
  if (!cobble) break;
  await bot.equip(cobble, 'hand');
  bot.setControlState('jump', true);
  await sleep(250);
  const below = bot.entity.position.floored().offset(0, -1, 0);
  try {
    await bot.placeBlock(bot.blockAt(below), new Vec3(0, 1, 0));
  } catch (e) {}
  bot.setControlState('jump', false);
  await sleep(200);
}

console.log('Pos after tower:', lib.fmt(bot.entity.position));

// 3. Walk across surface to base entrance (294, 72, -53)
console.log('Walking across surface to base (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1);
  console.log('At base entrance!');
} catch (e) {
  console.log('goTo error:', e.message);
  await lib.goToXZ(294, -53);
}

// 4. Step through door into base
const doorBlk = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlk) {
  try {
    if (!doorBlk.getProperties().open) await bot.activateBlock(doorBlk);
    await lib.walkTo(293.5, -56.0, 3000);
    const dAfter = bot.blockAt(new Vec3(294, 72, -54));
    if (dAfter && dAfter.getProperties().open) await bot.activateBlock(dAfter);
    console.log('Inside base!');
  } catch (e) {}
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight, 's');
