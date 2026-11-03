// programs/733-fast-reenter-and-join-tunnel-patrol.js
console.log('=== Program 733: Fast Re-enter Nether & Join Covered Tunnel Patrol ===');
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

console.log('Gear check: offhand =', bot.inventory.slots[45]?.name, 'held =', bot.heldItem?.name);

// 2. Chat team update
bot.chat('alpha: Respawned with full 20/20 HP & Food! Warping into Nether portal now to join Beta & Gamma in covered tunnel!');

// 3. Enter Nether portal using 1-line helper
console.log('Warping through Nether Portal at (299.5, 73.0, -54.0)...');
const portalRes = await globalThis.enterNetherPortal();
console.log('Portal warp result:', JSON.stringify(portalRes));

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp to Nether: still in ${bot.game.dimension}`);
}

bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Marching to Covered Tunnel (44, 65, -145..-168) and Pillbox!`);

// 4. March to Pillbox and covered tunnel using preloaded helper
console.log('Marching along safe waypoints to Covered Tunnel & Pillbox...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March result:', JSON.stringify(marchRes));

// 5. Patrol and combat loop at frontline
console.log('Patrolling covered tunnel / Pillbox for 40s...');
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 40000);
console.log('Combat result:', JSON.stringify(farmRes));

// 6. Vacuum all drops in range
await lib.pickup(4.0);

const rods = lib.count('blaze_rod');
const pearls = lib.count('ender_pearl');
bot.chat(`alpha: Patrol & combat completed. Pos: ${lib.fmt(bot.entity.position)}, Rods: ${rods}, Pearls: ${pearls}, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  rods,
  pearls,
  inv: lib.inv()
};
