// programs/563-pickup-item-and-report.js
console.log('=== PICKUP ITEM NEAR BASE (292, 70, -55) ===');

try {
  await bot.pathfinder.goto(new goals.GoalNear(292, 70, -55, 1.0));
  await sleep(400);
  await lib.pickup(4);
} catch (e) {
  console.log('Pickup error:', e.message);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
return { inv: lib.inv() };
