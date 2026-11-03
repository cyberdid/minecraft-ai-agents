console.log('=== PROGRAM 693: DELTA FAST MARCH & BLAZE FARM ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta starting pos:', lib.fmt(bot.entity.position), 'dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Ensure golden boots on feet and shield in offhand
const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
if (boots && bot.inventory.slots[8]?.name !== 'golden_boots') {
  await bot.equip(boots, 'feet');
  console.log('Equipped golden_boots to feet');
}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  await bot.equip(shield, 'off-hand');
  console.log('Equipped shield to offhand');
}
try { await lib.equipWeapon(); } catch (e) {}

bot.chat('delta: Marching via fast autoload helpers to Spawner Pillbox (36.5, 66, -187) to harvest 8 Blaze Rods!');

// 2. Warp into the_nether if in overworld
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal at (299.5, 73, -54)...');
  const portalRes = await globalThis.enterNetherPortal(30000);
  console.log('Portal transit result:', JSON.stringify(portalRes));
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter Nether: currently in ${bot.game.dimension}`);
}

// 3. March safe waypoints directly to Blaze Spawner Pillbox
console.log('Executing marchToSpawnerPillbox()...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March complete! Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. Farm Blaze Rods at Pillbox
const initialRods = lib.count('blaze_rod');
console.log(`Engaging farmBlazeRodsAtPillbox(8, 120000)... Initial rods: ${initialRods}`);
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 120000);
console.log('farmBlazeRodsAtPillbox finished:', JSON.stringify(farmRes));

const finalRods = lib.count('blaze_rod');
bot.chat(`delta: Blaze combat session complete! Total Blaze Rods held: ${finalRods}/8!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
