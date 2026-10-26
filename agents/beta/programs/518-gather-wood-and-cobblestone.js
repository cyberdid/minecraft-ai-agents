// programs/518-gather-wood-and-cobblestone.js
console.log('=== Step: Gather Wood & Cobblestone for Re-arming ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check nearby items on ground
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15);
if (drops.length > 0) {
  console.log(`Found ${drops.length} item drops nearby!`);
  for (const d of drops) {
    console.log(`Drop at ${lib.fmt(d.position)}`);
    try {
      await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5);
    } catch (e) {}
  }
}

// 2. Door location to exit base
console.log('Opening base door to gather resources...');
try {
  // Exit through base door at (296, 72, -56)
  await lib.goThroughDoor(296, 72, -56);
  console.log('Stepped through door! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door passage note:', e.message);
  // If not through door, look for oak door
  const doorBlock = bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 5 });
  if (doorBlock) {
    console.log('Found door at', lib.fmt(doorBlock.position));
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
  }
}

// 3. Gather 4 oak logs
console.log('Collecting 4 oak_log...');
try {
  await lib.collect('oak_log', 4, 30);
  console.log('Collected logs! Inventory logs:', bot.inventory.count(mcData.itemsByName.oak_log.id));
} catch (e) {
  console.log('Error collecting oak_log:', e.message);
  // Try any wood log
  try {
    const logBlock = bot.findBlock({ matching: b => b.name.endsWith('_log'), maxDistance: 25 });
    if (logBlock) {
      await lib.goTo(logBlock.position.x, logBlock.position.y, logBlock.position.z, 2);
      await lib.dig(logBlock.position.x, logBlock.position.y, logBlock.position.z);
    }
  } catch (e2) {}
}

// 4. Craft planks and sticks
const logCount = bot.inventory.items().filter(i => i.name.endsWith('_log')).reduce((acc, i) => acc + i.count, 0);
console.log(`Total logs in inventory: ${logCount}`);
if (logCount > 0) {
  try {
    await lib.craft('oak_planks', logCount * 4);
  } catch (e) {
    try { await lib.craft('oak_planks', 4); } catch (e2) {}
  }
  try {
    await lib.craft('stick', 4);
  } catch (e) {}
  try {
    await lib.craft('wooden_pickaxe', 1);
  } catch (e) {}
}

// 5. Gather cobblestone
console.log('Collecting 16 cobblestone/stone...');
try {
  await lib.collect('cobblestone', 16, 25);
} catch (e) {
  console.log('Error collecting cobblestone:', e.message);
  // Mine nearby stone
  const stoneBlocks = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 15, count: 5 });
  for (const sp of stoneBlocks) {
    if (bot.inventory.count(mcData.itemsByName.cobblestone.id) >= 16) break;
    try {
      await lib.goTo(sp.x, sp.y, sp.z, 2);
      await lib.dig(sp.x, sp.y, sp.z);
    } catch (e2) {}
  }
}

// 6. Craft stone pickaxe and stone sword
try {
  await lib.craft('stone_pickaxe', 1);
} catch (e) {
  console.log('Stone pickaxe craft note:', e.message);
}
try {
  await lib.craft('stone_sword', 1);
} catch (e) {
  console.log('Stone sword craft note:', e.message);
}

// 7. Report inventory
const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Current Inventory:', inv || 'empty');
return inv;
