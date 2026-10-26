// programs/410-ascend-and-repair-door.js
console.log('=== Program 410: Ascend to Base Floor & Repair Door ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Check surrounding blocks
console.log('Block at feet:', bot.blockAt(bot.entity.position)?.name);
console.log('Block below feet:', bot.blockAt(bot.entity.position.offset(0, -1, 0))?.name);

// 2. Ascend to base floor (294, 72, -55)
try {
  console.log('Ascending to (294, 72, -55)...');
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 20000 });
} catch (e) {
  console.log('goTo base floor note:', e.message);
  // If stuck in a hole, tower up with dirt/cobblestone
  console.log('Towering up...');
  const currentY = Math.floor(bot.entity.position.y);
  for (let y = currentY; y < 72; y++) {
    bot.setControlState('jump', true);
    await sleep(250);
    const placeBlock = bot.inventory.items().find(i => ['cobblestone', 'dirt'].includes(i.name));
    if (placeBlock) {
      try {
        await bot.equip(placeBlock, 'hand');
        const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        if (below) await bot.placeBlock(below, new Vec3(0, 1, 0));
      } catch (err) {}
    }
    bot.setControlState('jump', false);
    await sleep(250);
  }
  await lib.goTo(294, 72, -55, 1);
}

console.log('Alpha reached pos:', lib.fmt(bot.entity.position));

// 3. Check door at (294, 72, -54)
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', doorBlock?.name);
if (!doorBlock || doorBlock.name === 'air') {
  console.log('Door missing! Placing oak_door back...');
  try {
    await lib.place('oak_door', 294, 72, -54);
    console.log('Door replaced!');
  } catch (e) {
    console.log('Place door note:', e.message);
  }
}

// 4. Craft stone_pickaxe at crafting table (295, 72, -56)
try {
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  }
} catch (e) {
  console.log('Craft pickaxe note:', e.message);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Inventory:', JSON.stringify(lib.inv()));
