// programs/607-vacuum-drops-heal-and-seal-bunker.js
console.log('=== Program 607: Vacuum Drops, Heal & Fortify Spawner Pillbox ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Scan for nearby dropped items (food, blaze rods, gear)
const drops = Object.values(bot.entities).filter(
  e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8.0
);
console.log(`Found ${drops.length} dropped items within 8m:`);
for (const d of drops) {
  console.log(`- drop at ${lib.fmt(d.position)} (dist ${d.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// 2. Vacuum nearby drops
console.log('Vacuuming nearby drops...');
try {
  const gained = await lib.pickup(6);
  console.log(`Vacuumed ${gained} items!`);
} catch (e) {
  console.log('Pickup error:', e.message);
}

console.log('Inventory after pickup:', lib.inv());

// 3. If food gained, eat immediately to regenerate health!
const foodItems = ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple', 'baked_potato'];
for (const f of foodItems) {
  if (lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    try {
      await lib.eat();
      console.log(`Ate ${f}! Current HP: ${bot.health.toFixed(1)}, Food: ${bot.food}`);
    } catch (e) {}
  }
}

// 4. Equip shield and best weapon
await lib.equipArmor();
await lib.equipWeapon();
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);

// 5. Seal defensive bunker at (37, 65, -182)
// Place cobblestone wall facing North (z=-183..-184) to block fireballs and Wither Skeleton
if (lib.count('cobblestone') >= 4) {
  console.log('Fortifying front blast wall...');
  // Place floor if missing
  try {
    const fBlock = bot.blockAt(new Vec3(37, 64, -183));
    if (fBlock && fBlock.name === 'air') {
      await lib.place('cobblestone', 37, 64, -183);
    }
  } catch (e) {}
  
  // Place lower wall at y=65
  try {
    const w1 = bot.blockAt(new Vec3(37, 65, -183));
    if (w1 && w1.name === 'air') {
      await lib.place('cobblestone', 37, 65, -183);
    }
  } catch (e) {}
  
  // Place roof at y=67
  try {
    const r1 = bot.blockAt(new Vec3(37, 67, -182));
    if (r1 && r1.name === 'air') {
      await lib.place('cobblestone', 37, 67, -182);
    }
  } catch (e) {}
  
  // Place upper wall at y=67 over slit
  try {
    const w2 = bot.blockAt(new Vec3(37, 67, -183));
    if (w2 && w2.name === 'air') {
      await lib.place('cobblestone', 37, 67, -183);
    }
  } catch (e) {}
}

bot.chat(`alpha: Pillbox secured at ${lib.fmt(bot.entity.position)}! HP: ${bot.health.toFixed(1)}, Rods: ${lib.count('blaze_rod')}/8`);

// 6. Combat Loop: Strike Blazes through 1-block waist slit
console.log('Starting stationary combat loop from behind bunker wall...');
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let rounds = 0;

while (Date.now() - combatStart < 60000 && !isCancelled() && bot.health > 4) {
  await lib.equipWeapon();
  await lib.equipArmor();
  
  // Target blazes within 5.5 blocks
  const blazes = Object.values(bot.entities).filter(
    e => e.name === 'blaze' && e.isValid && e.position.distanceTo(bot.entity.position) < 5.8
  ).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));
  
  if (blazes.length > 0) {
    const target = blazes[0];
    console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist ${target.position.distanceTo(bot.entity.position).toFixed(1)}m)...`);
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    bot.attack(target);
    rounds++;
    await sleep(450);
    if (target.isValid && target.position.distanceTo(bot.entity.position) < 5.8) {
      bot.attack(target);
      await sleep(450);
    }
  } else {
    await sleep(400);
  }
  
  if (rounds % 2 === 0) {
    try { await lib.pickup(4); } catch (e) {}
  }
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
    break;
  }
}

const finalRods = lib.count('blaze_rod');
console.log('Final inventory:', lib.inv());
console.log('Blaze Rods in inv:', finalRods, 'HP:', bot.health.toFixed(1));
bot.chat(`alpha: Spawner engagement round complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
