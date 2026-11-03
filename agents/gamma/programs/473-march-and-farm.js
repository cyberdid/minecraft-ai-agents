// programs/473-march-and-farm.js
globalThis.isProgramCancelled = () => isCancelled();

console.log('=== GAMMA NETHER DEPLOYMENT ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('gamma: Advancing to Spawner Pillbox (36.5, 66, -187) with active shield!');

// 1. Ensure weapon & shield
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 2. March to Spawner Pillbox
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// 3. Farm Blaze Rods at Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: In Pillbox firing slit! Farming Blazes with active shield defense!');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm completed:', JSON.stringify(farmRes));
}

const finalRods = lib.count('blaze_rod');
bot.chat(`gamma: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
