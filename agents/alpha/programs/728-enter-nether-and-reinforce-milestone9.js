// programs/728-enter-nether-and-reinforce-milestone9.js
console.log('=== Program 728: Enter Nether & Reinforce Milestone 9 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Quick regear with our existing blocks and weapons
try {
  await globalThis.quickRegear({ cobble: 5 });
} catch (e) {
  console.log('quickRegear note:', e.message);
}

// Ensure shield in offhand and iron sword in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sword) await bot.equip(sword, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

console.log('Gear check: offhand =', bot.inventory.slots[45]?.name, 'held =', bot.heldItem?.name);

// 2. Chat team update
bot.chat('alpha: Dawn at Overworld base! HP 20/20, Food 20/20. Entering Nether portal to advance Milestone 9!');

// 3. Enter Nether portal using 1-line helper
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
const portalRes = await globalThis.enterNetherPortal();
console.log('Portal warp result:', JSON.stringify(portalRes));

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp to Nether: still in ${bot.game.dimension}`);
}

bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Marching to Covered Tunnel and Pillbox (36, 66, -187)!`);

// 4. March to Spawner Pillbox using preloaded helper
console.log('Marching along safe waypoints to Spawner Pillbox...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March result:', JSON.stringify(marchRes));

// 5. Check nearby Piglins and Endermen at covered corridor / Pillbox
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 20);
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 20);
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 10);

console.log(`Entities nearby: Piglins=${piglins.length}, Endermen=${endermen.length}, Items=${items.length}`);

// 6. Farm Blazes safely at Pillbox for 30s
console.log('Engaging Blaze combat loop at Pillbox...');
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 30000);
console.log('Farm result:', JSON.stringify(farmRes));

// 7. Vacuum all drops around position
await lib.pickup(4.0);

const rods = lib.count('blaze_rod');
const pearls = lib.count('ender_pearl');
bot.chat(`alpha: Operations update: Pos ${lib.fmt(bot.entity.position)}, Rods: ${rods}, Pearls: ${pearls}, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  rods,
  pearls,
  inv: lib.inv()
};
