// programs/524-march-to-spawner-pillbox.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 524: FAST MARCH TO SPAWNER PILLBOX & ENGAGE ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Team chat
bot.chat('gamma: Marching from Nether portal camp to Spawner Pillbox (36, 66, -187) using fast march helper!');

// Step 2: Fast march using preloaded helper
console.log('Beginning march across Nether safe waypoints...');
const marchResult = await globalThis.marchToSpawnerPillbox();
console.log('March completed. Result:', JSON.stringify(marchResult));

// Step 3: Check current position and surroundings
const currentPos = bot.entity.position;
console.log('Position after march:', lib.fmt(currentPos), 'HP:', bot.health);

const pillboxTarget = new Vec3(36.5, 66.0, -187.0);
const distToPillbox = currentPos.distanceTo(pillboxTarget);
console.log(`Distance to Spawner Pillbox: ${distToPillbox.toFixed(1)}m`);

// Step 4: If reached Pillbox area (dist <= 6m), engage Blazes at Pillbox
let farmResult = null;
if (distToPillbox <= 6.0 && bot.health > 8) {
  bot.chat(`gamma: Arrived at Spawner Pillbox (${lib.fmt(currentPos)})! Engaging Blazes with active shield defense!`);
  console.log('Engaging farmBlazeRodsAtPillbox for 60 seconds...');
  farmResult = await globalThis.farmBlazeRodsAtPillbox(8, 60000);
  console.log('Pillbox combat result:', JSON.stringify(farmResult));
} else {
  console.log(`Stopped at ${lib.fmt(currentPos)} (HP: ${bot.health}).`);
}

// Step 5: Check any Piglins nearby for bartering if we still have gold
if (lib.count('gold_ingot') > 0) {
  const piglin = Object.values(bot.entities).find(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 6.0
  );
  if (piglin) {
    console.log(`Found neutral Piglin nearby at ${lib.fmt(piglin.position)}! Tossing gold ingot...`);
    try {
      await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
      await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
      bot.tossStack(bot.heldItem);
      console.log('Tossed gold ingot to Piglin! Waiting 8s for barter drops...');
      await sleep(8000);
      await lib.pickup(4.0);
    } catch (e) {
      console.log('Barter note:', e.message);
    }
  }
}

// Final status summary
const finalRods = lib.count('blaze_rod');
const finalPearls = lib.count('ender_pearl');
console.log(`=== Status: Rods: ${finalRods}, Pearls: ${finalPearls}, HP: ${bot.health.toFixed(1)}, Food: ${bot.food} ===`);

bot.chat(`gamma: At ${lib.fmt(bot.entity.position)}. Rods: ${finalRods}, Pearls: ${finalPearls}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  rods: finalRods,
  pearls: finalPearls,
  marchResult,
  farmResult,
  inv: lib.inv()
};
