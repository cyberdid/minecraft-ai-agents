// programs/171-raw-dig-above-and-surface.js
console.log('--- Raw Dig Above and Surface ---');
console.log('Pos:', lib.fmt(bot.entity.position));

const p = bot.entity.position.floored();

// 1. Dig straight up using bot.dig (no pathfinder needed!)
for (let y = p.y + 1; y <= 71; y++) {
  const blk = bot.blockAt(new Vec3(p.x, y, p.z));
  if (blk && blk.name !== 'air' && blk.boundingBox === 'block') {
    console.log(`Digging ${blk.name} at y=${y}...`);
    try {
      await bot.equip(mcData.itemsByName.stone_axe.id, 'hand');
      await bot.lookAt(blk.position.offset(0.5, 0.5, 0.5));
      await bot.dig(blk);
      console.log(`Dug ${blk.name} at y=${y}!`);
    } catch (e) {
      console.log(`Error digging y=${y}:`, e.message);
    }
  }
}

// 2. Tower up
console.log('Towering up...');
for (let i = 0; i < 7; i++) {
  const curY = bot.entity.position.y;
  if (curY >= 71) {
    console.log(`Reached surface level at y=${curY}!`);
    break;
  }
  const cobble = bot.inventory.items().find(it => it.name === 'cobblestone' || it.name === 'dirt');
  if (!cobble) break;
  await bot.equip(cobble, 'hand');
  bot.setControlState('jump', true);
  await sleep(250);
  const below = bot.entity.position.floored().offset(0, -1, 0);
  try {
    await bot.placeBlock(bot.blockAt(below), new Vec3(0, 1, 0));
  } catch (e) {}
  bot.setControlState('jump', false);
  await sleep(250);
}

console.log('Pos now:', lib.fmt(bot.entity.position));

// 3. If on surface, walk to base entrance (294, 72, -53)
if (bot.entity.position.y >= 70) {
  console.log('On surface! Navigating to base entrance...');
  try {
    await lib.goTo(294, 72, -53, 1);
    console.log('At base entrance!');
    // Enter through door
    const d = bot.blockAt(new Vec3(294, 72, -54));
    if (d && !d.getProperties().open) await bot.activateBlock(d);
    await lib.walkTo(293.5, -56.0, 3000);
    const dAfter = bot.blockAt(new Vec3(294, 72, -54));
    if (dAfter && dAfter.getProperties().open) await bot.activateBlock(dAfter);
    console.log('Inside base!');
  } catch (e) {
    console.log('Surface nav error:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight, 's');
