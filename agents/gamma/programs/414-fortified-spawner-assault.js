// programs/414-fortified-spawner-assault.js
console.log('=== FORTIFIED SPAWNER ASSAULT & HARVEST (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Regear with weapon & cobblestone
await globalThis.quickRegear({ cobble: 16 });
bot.chat('gamma: Regeared! Scurrying along covered waypoints to Blaze Spawner Pillbox (37, 66, -186)!');

// 2. March directly to Spawner Pillbox
console.log('Marching to Spawner Pillbox...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// 3. Reinforce West blind spot at cross bridge (38, 65, -176) if needed
if (bot.game.dimension === 'the_nether' && lib.count('cobblestone') >= 2) {
  try {
    const blindSpot = new Vec3(38, 66, -176);
    const b = bot.blockAt(blindSpot);
    if (b && (b.name === 'air' || b.name === 'cave_air')) {
      console.log('Placing cobblestone blast block at blind spot (38, 66, -176)...');
      await lib.place('cobblestone', blindSpot.x, blindSpot.y, blindSpot.z);
    }
  } catch (e) {
    console.log('Blast block placement note:', e.message);
  }
}

// 4. Position at Pillbox firing station
if (bot.game.dimension === 'the_nether') {
  console.log('Entering Pillbox station at (37, 66, -186)...');
  try {
    await lib.goTo(37.0, 66, -186, 1.0, { dig: false, timeoutMs: 5000 });
  } catch (e) {}

  // Vacuum any dropped items on arrival (rods, weapons, armor)
  try {
    const p = await lib.pickup(4);
    if (p > 0) console.log(`Picked up ${p} frontline drops on arrival!`);
  } catch (e) {}

  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat('gamma: In Spawner Pillbox station! Slaying Blazes alongside Beta and Delta!');

  // 5. Farm Blazes for 120s
  console.log('Starting farmBlazeRodsAtPillbox...');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm result:', JSON.stringify(farmRes));

  const rods = lib.count('blaze_rod');
  console.log(`Current Blaze Rods in inventory: ${rods}`);
  if (rods >= 8) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Reached ${rods} Blaze Rods!`);
    console.log('Retreating to Overworld base with rods...');
    await globalThis.retreatToOverworldBase();
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
