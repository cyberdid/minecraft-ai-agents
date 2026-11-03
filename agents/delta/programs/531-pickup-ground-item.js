// programs/531-pickup-ground-item.js
console.log('=== DELTA: PICKUP GROUND ITEM ===');

const item = bot.entities[994] || Object.values(bot.entities).find(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8);
if (item) {
  console.log(`Found item at ${lib.fmt(item.position)}:`, JSON.stringify(item.metadata));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.5));
    await sleep(500);
    await lib.pickup(3);
  } catch (e) {
    console.log('Pickup error:', e.message);
  }
} else {
  console.log('Item not found, running lib.pickup(8)...');
  await lib.pickup(8);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
return { inv: lib.inv() };
