// programs/092-tower-to-surface.js
console.log('--- VERTICAL TOWER TO SURFACE ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));

await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');

// Dig up and jump until y >= 71
for (let i = 0; i < 30 && bot.entity.position.y < 71 && !isCancelled(); i++) {
  const p = bot.entity.position.floored();
  
  // 1. Dig 2 blocks above head
  for (const dy of [2, 3]) {
    const b = bot.blockAt(p.offset(0, dy, 0));
    if (b && b.boundingBox === 'block') {
      await lib.dig(b.position.x, b.position.y, b.position.z);
      await sleep(100);
    }
  }

  // 2. Look down and place block while jumping
  const item = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('birch_planks') > 0 ? 'birch_planks' : null);
  if (!item) {
    console.log('No blocks left to tower!');
    break;
  }

  const itemId = mcData.itemsByName[item].id;
  await bot.equip(itemId, 'hand');
  
  // Jump
  bot.setControlState('jump', true);
  await sleep(200);
  
  // Place against the block below feet
  const below = bot.blockAt(p);
  if (below && below.boundingBox === 'block') {
    try {
      await bot.placeBlock(below, new Vec3(0, 1, 0));
    } catch (e) {}
  }
  
  bot.setControlState('jump', false);
  await sleep(150);
  console.log(`Current y: ${bot.entity.position.y.toFixed(1)}`);
}

console.log('Tower complete! Pos:', lib.fmt(bot.entity.position));

// If on or near surface, walk to Nether portal (299, 73, -54)
if (bot.entity.position.y >= 68) {
  console.log('Navigating across surface to Nether portal (299, 73, -54)...');
  try {
    await lib.goTo(299, 73, -54, 1, { timeoutMs: 30000 });
    console.log('At Nether portal! Entering...');
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  } catch (e) {
    console.log('Portal walk note:', e.message);
  }
}

bot.chat(`gamma reached surface: pos=${lib.fmt(bot.entity.position)}, health=${bot.health}, food=${bot.food}`);
