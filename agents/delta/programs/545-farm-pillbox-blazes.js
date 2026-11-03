// programs/545-farm-pillbox-blazes.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: PILLBOX BLAZE SLAYER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Rods: ${lib.count('blaze_rod')}`);

// Ensure shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// Settle tightly into pillbox firing slit at (36.5, 66.0, -187.0)
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.4));
} catch (e) {}

console.log('Engaging farmBlazeRodsAtPillbox(8, 85000)...');
const res = await farmBlazeRodsAtPillbox(8, 85000);
console.log('farmBlazeRodsAtPillbox complete:', JSON.stringify(res));

// Vacuum pillbox floor for any rods/glowstone
try { await lib.pickup(3.0); } catch (e) {}

console.log('=== POST COMBAT STATUS ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Rods: ${lib.count('blaze_rod')}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  pos: bot.entity.position,
  inv: lib.inv()
};
