// programs/546-scan-trees-and-base-chest.js
console.log('=== Step: Scan Logs, Base Chest, and Teammates ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Find all log blocks within 64 blocks
const allLogs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 64,
  count: 30
});
console.log(`Found ${allLogs.length} log blocks within 64m`);
const accessibleLogs = allLogs.filter(p => p.y <= 74);
console.log(`Accessible logs (y <= 74): ${accessibleLogs.length}`);
for (const lp of accessibleLogs.slice(0, 10)) {
  const b = bot.blockAt(lp);
  console.log(`  Log at ${lib.fmt(lp)} (${b?.name}) dist=${bot.entity.position.distanceTo(lp).toFixed(1)}m`);
}

// 2. Return to Base Camp (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
console.log(`Heading up to Base Camp at ${lib.fmt(doorPos)}...`);
try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2, { dig: true });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(doorPos.x, doorPos.y, doorPos.z, 2)); } catch (e2) {}
}

// Enter base door
const doorBlock = bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 5 });
if (doorBlock) {
  try { await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z); } catch (e) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Inspect base chest at (293, 72, -57)
const chestBlock = bot.findBlock({ matching: mcData.blocksByName.chest.id, maxDistance: 6 });
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.items();
    console.log(`Chest contents (${items.length} stacks):`, items.map(i => `${i.name} x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['cooked_porkchop', 'stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'cobblestone', 'oak_log', 'oak_planks', 'stick'].includes(it.name)) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        try { await chest.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await chest.close();
  } catch (e) {
    console.log('Error opening chest:', e.message);
  }
}

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

console.log('Beta inv after check:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
