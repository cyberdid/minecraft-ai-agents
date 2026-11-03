// programs/598-stationary-blaze-slayer.js
console.log('=== Program 598: Stationary Blaze Slayer & Rod Harvest ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Initial inventory & equipment check
await lib.equipWeapon();
await lib.equipArmor();
console.log('Equipped weapon:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);
console.log('Initial inventory:', lib.inv());

// 2. Scoop any immediately nearby drops (shield, food, rods)
try {
  const initialDrops = await lib.pickup(4);
  console.log(`Initial pickup gained: ${initialDrops} items`);
} catch (e) {}

await lib.equipArmor();
await lib.equipWeapon();

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

bot.chat(`alpha: Slaying Blazes from Spawner Pillbox! Rods: ${lib.count('blaze_rod')}/8, HP: ${bot.health.toFixed(1)}/20`);

// 3. Stationary Combat Loop
const anchorPos = new Vec3(37.5, 66.0, -186.5);
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let attackRounds = 0;

while (Date.now() - combatStart < 120000 && !isCancelled() && bot.health > 4) {
  // Enforce position anchor: NEVER wander west of x=36.0!
  if (bot.entity.position.x < 36.0 || bot.entity.position.distanceTo(anchorPos) > 3.0) {
    console.log(`Re-anchoring from ${lib.fmt(bot.entity.position)} to ${lib.fmt(anchorPos)}...`);
    await bot.lookAt(anchorPos, true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  // Ensure weapon equipped
  if (!bot.heldItem || !bot.heldItem.name.includes('sword')) {
    await lib.equipWeapon();
  }
  await lib.equipArmor();

  // Find Blazes within 5.5 blocks
  const blazes = Object.values(bot.entities).filter(
    e => e.name === 'blaze' && e.isValid && e.position.distanceTo(bot.entity.position) < 5.8
  ).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    const dist = target.position.distanceTo(bot.entity.position);
    console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist ${dist.toFixed(1)}m)...`);
    
    // Look directly at Blaze center
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    bot.attack(target);
    attackRounds++;
    await sleep(450);
    
    if (target.isValid && target.position.distanceTo(bot.entity.position) < 5.8) {
      bot.attack(target);
      await sleep(450);
    }
  } else {
    // If no blazes in immediate melee range, check if any floating nearby
    const distantBlazes = Object.values(bot.entities).filter(
      e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 12.0
    );
    if (distantBlazes.length > 0) {
      console.log(`Blazes nearby (${distantBlazes.length}): nearest at ${lib.fmt(distantBlazes[0].position)} (dist ${distantBlazes[0].position.distanceTo(bot.entity.position).toFixed(1)}m)`);
    }
    await sleep(500);
  }

  // Vacuum drops within 4 meters every 3 attack rounds
  if (attackRounds % 3 === 0) {
    try {
      await lib.pickup(4);
    } catch (e) {}
  }

  // Monitor Blaze Rods
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods}/8 +++`);
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }

  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
    console.log(`+++ MILESTONE 8 COMPLETE: ${currentRods} BLAZE RODS +++`);
    break;
  }
}

// 4. Tactical retreat if low health
if (bot.health <= 4) {
  console.log('Health low! Tactical retreat along covered corridor to (44, 65, -174)...');
  bot.chat(`alpha: Low health (${bot.health.toFixed(1)} HP)! Retreating behind blast wall!`);
  try {
    await lib.goTo(44, 65, -174, 2, { timeoutMs: 6000 });
  } catch (e) {}
}

const finalRods = lib.count('blaze_rod');
console.log('Final inventory:', lib.inv());
console.log('Blaze Rods in inventory:', finalRods, 'Health:', bot.health.toFixed(1));
bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
