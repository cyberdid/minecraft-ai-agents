// programs/319-pickup-dropped-items.js
console.log('=== PICKUP DROPPED ITEMS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Walk to (288, 65, -53)
console.log('Walking to item drop at (288, 65, -53)...');
try {
  await lib.goTo(288, 65, -53, 1, { timeoutMs: 8000 });
  await sleep(300);
  await lib.pickup(8);
  console.log('Inv after first pickup:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Pickup 1 note:', e.message);
}

// Check if items at (303, 75, -87) are reachable
console.log('Checking second drop at (303, 75, -87)...');
try {
  await lib.goTo(303, 75, -87, 2, { timeoutMs: 12000 });
  await sleep(300);
  await lib.pickup(8);
  console.log('Inv after second pickup:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Pickup 2 note:', e.message);
}

// Return to base door
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('\n=== FINAL INVENTORY ===');
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));
