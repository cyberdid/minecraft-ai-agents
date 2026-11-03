// programs/632-pillbox-slayer-harvest.js
console.log('=== Program 632: Pillbox Blaze Slayer & Rod Harvest ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Lock stationary position behind pillbox wall
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// Equip stone_sword
await lib.equipWeapon();
console.log('Equipped weapon:', bot.heldItem?.name, 'Durability:', lib.tools());

// Announce ready in chat
bot.chat(`alpha: Locked behind pillbox wall at (36, 66, -184)! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;
let attacks = 0;

while (!isCancelled() && Date.now() - combatStart < 85000) {
  // Health safety check
  if (bot.health < 7) {
    console.log(`WARNING: Health critical (${bot.health.toFixed(1)}/20)! Taking tactical cover at (37, 65, -177)...`);
    try {
      await lib.goTo(37, 65, -177, 1, { timeoutMs: 3000 });
    } catch (e) {}
    bot.chat(`alpha: Health low (${bot.health.toFixed(1)}/20), holding cover at (37, 65, -177)!`);
    break;
  }
  
  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Strike through waist firing slit (reach <= 4.8m)
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      attacks++;
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (Blaze HP: ${target.health.toFixed(1)}) [Hit #${attacks}]`);
      if (target.health <= 0) {
        killed++;
        console.log(`+++ Blaze ELIMINATED! Total killed this round: ${killed} +++`);
      }
    }
  }
  
  // Micro-pickup drops within safe stationary reach (<= 2.5m, never step west of x=35.5)
  if (Math.random() < 0.25) {
    try {
      const gained = await lib.pickup(2.5);
      if (gained > 0) {
        console.log(`Picked up ${gained} drops!`);
        await lib.equipArmor();
        await lib.equipWeapon();
      }
    } catch (e) {}
  }
  
  // Check for Blaze Rod harvest
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`****************************************************`);
    console.log(`+++ BLAZE ROD HARVESTED! Total in inv: ${currentRods} +++`);
    console.log(`****************************************************`);
    bot.chat(`alpha: BLAZE ROD HARVESTED! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  // Milestone 8 victory condition
  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! ${currentRods} Blaze Rods harvested! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(150);
}

// Final pickup
try {
  await lib.pickup(2.5);
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('=== COMBAT ROUND SUMMARY ===');
console.log(`Killed: ${killed}, Attacks: ${attacks}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
bot.chat(`alpha: Combat round done. Killed: ${killed}, Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
