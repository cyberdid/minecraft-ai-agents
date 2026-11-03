// programs/738-pillbox-assault-fortified.js
console.log('=== Program 738: Advance to Fortified Pillbox & Engage Blazes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

bot.chat('alpha: Advancing along covered corridor to fortified Spawner Pillbox (36, 67, -187)!');

// 2. March remaining waypoints to Pillbox using preloaded helper
console.log('Marching to Spawner Pillbox...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March result:', JSON.stringify(marchRes));

bot.chat(`alpha: Locked inside fortified Pillbox (${lib.fmt(bot.entity.position)}) with active shield! Slaying Blazes!`);

// 3. Farm Blazes through firing slit for 45s
console.log('Engaging Blaze combat loop at fortified Pillbox...');
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 45000);
console.log('Farming result:', JSON.stringify(farmRes));

// 4. Vacuum drops safely
await lib.pickup(4.0);

const rods = lib.count('blaze_rod');
const pearls = lib.count('ender_pearl');
bot.chat(`alpha: Combat complete at Pillbox. Rods: ${rods}, Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  rods,
  pearls,
  inv: lib.inv()
};
