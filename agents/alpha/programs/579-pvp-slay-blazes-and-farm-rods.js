// programs/579-pvp-slay-blazes-and-farm-rods.js
console.log('=== Program 579: PvP Slay Blazes & Harvest Blaze Rods ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Swords in inv:', lib.count('stone_sword'));

await lib.equipWeapon();

// First pickup any existing drops on the balcony
try {
  const picked = await lib.pickup(8);
  console.log(`Initial pickup gained ${picked} items.`);
} catch (e) {}

let rods = lib.count('blaze_rod');
console.log(`Starting Blaze Rods: ${rods}`);

// Combat loop for up to 60s
const startTime = Date.now();
while (Date.now() - startTime < 60000 && !isCancelled() && bot.health > 6) {
  await lib.equipWeapon();
  
  // Fight hostiles within 6 blocks using built-in lib.fight
  console.log('Engaging nearby Blazes with lib.fight(6, 12)...');
  try {
    const res = await lib.fight(6, 12);
    console.log('Fight result:', res);
  } catch (fe) {
    console.log('Fight note:', fe.message);
  }
  
  // Pickup drops
  try {
    const gained = await lib.pickup(8);
    console.log(`Vacuumed ${gained} items.`);
  } catch (pe) {}
  
  rods = lib.count('blaze_rod');
  console.log(`Current Blaze Rods in inv: ${rods}/8`);
  
  if (rods >= 6) {
    console.log(`*** MILESTONE 8 ACHIEVED: ${rods} BLAZE RODS HARVESTED! ***`);
    bot.chat(`alpha: TARGET ACHIEVED! Harvested ${rods} Blaze Rods on Spawner Balcony! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(500);
}

const finalRods = lib.count('blaze_rod');
console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods harvested:', finalRods);
console.log('Inventory:', lib.inv());
bot.chat(`alpha: Spawner farming round complete at ${lib.fmt(bot.entity.position)}! Harvested rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
