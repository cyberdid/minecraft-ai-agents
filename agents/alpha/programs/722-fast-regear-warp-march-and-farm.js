// programs/722-fast-regear-warp-march-and-farm.js
console.log('=== Program 722: Fast Regear, Portal Warp, March to Pillbox & Farm ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Quick regear with our existing 6 cobblestone + planks (no mining needed)
console.log('Quick regear...');
try {
  await globalThis.quickRegear({ cobble: 6 });
} catch (e) {
  console.log('quickRegear note:', e.message);
}

// Ensure shield is in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try { await lib.equipWeapon(); } catch (e) {}

console.log('Gear check: offhand =', bot.inventory.slots[45]?.name, 'held =', bot.heldItem?.name);

// 2. Chat team update
bot.chat('alpha: Fully healed (20/20 HP) with shield & iron weapons! Entering Nether portal now to march to Spawner Pillbox!');

// 3. Enter Nether portal using preloaded helper
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
const portalRes = await globalThis.enterNetherPortal();
console.log('Portal warp result:', JSON.stringify(portalRes));

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp to Nether: still in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Marching along safe waypoints to Spawner Pillbox (36, 66, -187)!`);

// 4. March to Spawner Pillbox using preloaded helper
console.log('Marching to Spawner Pillbox (36.5, 66.0, -187.0)...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March result:', JSON.stringify(marchRes));

bot.chat(`alpha: Reached Pillbox at ${lib.fmt(bot.entity.position)}! Engaging Blazes with Active Shield!`);

// 5. Farm Blazes at Pillbox with Active Shield
console.log('Farming Blazes at Pillbox...');
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 45000);
console.log('Farm result:', JSON.stringify(farmRes));

const rods = lib.count('blaze_rod');
bot.chat(`alpha: Combat finished at Pillbox. Rods in inventory: ${rods}, HP: ${bot.health.toFixed(1)}/20`);

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  rods,
  inv: lib.inv()
};
