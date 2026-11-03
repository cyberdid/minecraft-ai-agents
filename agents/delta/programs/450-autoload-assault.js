// programs/450-autoload-assault.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// Ensure shield in offhand and sword in main hand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand:', offhand?.name, 'Held:', bot.heldItem?.name);

// Fast 1-line march to Spawner Pillbox using battle-tested helper
bot.chat('delta: Marching to Spawner Pillbox (36, 66, -187) via safe waypoints!');
console.log('Running marchToSpawnerPillbox()...');
const marchRes = await marchToSpawnerPillbox();
console.log('marchToSpawnerPillbox completed:', JSON.stringify(marchRes));

// Fast 1-line combat at Pillbox
bot.chat('delta: Inside Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods).');
console.log('Running farmBlazeRodsAtPillbox(8, 200000)...');
const farmRes = await farmBlazeRodsAtPillbox(8, 200000);
console.log('farmBlazeRodsAtPillbox completed:', JSON.stringify(farmRes));

const totalRods = lib.count('blaze_rod');
console.log(`Current Blaze Rods held: ${totalRods}/8, HP: ${bot.health}`);
bot.chat(`delta: Combat cycle complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

// If target reached, retreat to Overworld base
if (totalRods >= 8) {
  bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base to deposit.');
  console.log('Running retreatToOverworldBase()...');
  const retRes = await retreatToOverworldBase();
  console.log('retreatToOverworldBase completed:', JSON.stringify(retRes));

  if (bot.game.dimension === 'overworld') {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat('delta: Deposited all Blaze Rods into base chest (293, 72, -57)! Milestone 8 100% COMPLETE!');
    } catch (e) {}
  }
}
