// programs/720-fast-advance-pillbox-and-farm.js
console.log('=== Program 720: Fast Advance to Pillbox, Farm Blaze Rods & Coordinate ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Ensure shield is equipped in offhand and sword in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try { await lib.equipWeapon(); } catch (e) {}

console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// 2. Chat team coordination update
bot.chat('alpha: Advancing from Fortress Bunker to Spawner Pillbox (36, 66, -187) using fast march helper!');

// 3. Fast march to Spawner Pillbox using preloaded helper
console.log('Marching to Spawner Pillbox...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));
bot.chat(`alpha: Arrived at Pillbox (${lib.fmt(bot.entity.position)})! Engaging Blazes with active shield defense!`);

// 4. Farm Blaze Rods at Pillbox for 45s or until target reached
console.log('Engaging Blaze combat loop at Pillbox...');
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 45000);
console.log('Farming completed:', JSON.stringify(farmRes));

// 5. Check rods harvested
const rods = lib.count('blaze_rod');
bot.chat(`alpha: Pillbox combat finished. Harvested rods: ${rods}, HP: ${bot.health.toFixed(1)}/20. Initiating safe retreat!`);

// 6. Safe retreat to Overworld base to deposit, heal, and regear
console.log('Retreating to Overworld base...');
const retreatRes = await globalThis.retreatToOverworldBase();
console.log('Retreat result:', JSON.stringify(retreatRes));

// 7. If in Overworld base, deposit rods in Base Chest (293, 72, -57) and regear
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Checking base chest...');
  try {
    if (lib.count('blaze_rod') > 0) {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat(`alpha: Deposited ${rods} Blaze Rods into Base Chest (293, 72, -57)!`);
    }
  } catch (e) {
    console.log('Deposit error:', e.message);
  }

  // Sleep if night to fully restore HP and Food to 20/20
  if (lib.time().canSleep) {
    console.log('Night in Overworld! Sleeping to restore full HP & Food...');
    try {
      await lib.sleepInBed();
      bot.chat('alpha: Slept at base! HP and Food 100% restored!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }

  // Quick regear
  try {
    await globalThis.quickRegear({ cobble: 16 });
  } catch (e) {}
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
