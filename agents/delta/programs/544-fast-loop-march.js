// programs/544-fast-loop-march.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: FAST REGEAR & MARCH TO PILLBOX ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Ensure shield is in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// Step 2: Quick regear (ensures pickaxe, sword, cobble, armor/weapon equipped)
console.log('Running quickRegear({ cobble: 16 })...');
try {
  await quickRegear({ cobble: 16 });
} catch (e) {
  console.log('quickRegear note:', e.message);
}

// Ensure shield is still in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

bot.chat('delta: Regeared with shield & weapons! Marching via team helper to Spawner Pillbox (36, 66, -187)!');

// Step 3: March to Spawner Pillbox
console.log('Launching marchToSpawnerPillbox()...');
const marchResult = await marchToSpawnerPillbox();
console.log('marchToSpawnerPillbox result:', JSON.stringify(marchResult));

// Step 4: If at pillbox, engage Blazes safely from behind firing slit!
const pillboxPos = new Vec3(36.5, 66.0, -187.0);
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(pillboxPos) < 4.0) {
  console.log('Arrived at Pillbox! Engaging farmBlazeRodsAtPillbox...');
  bot.chat('delta: At Spawner Pillbox (36, 66, -187)! Farming Blazes with active shield defense!');
  const farmResult = await farmBlazeRodsAtPillbox(8, 70000);
  console.log('farmBlazeRodsAtPillbox result:', JSON.stringify(farmResult));
}

console.log('=== PROGRAM 544 COMPLETE ===');
console.log(`Final pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
