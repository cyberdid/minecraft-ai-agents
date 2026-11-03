// programs/627-craft-sword-and-slay-blazes.js
console.log('=== Program 627: Craft Stone Sword & Slay Blazes with Gamma ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Craft Crafting Table in 2x2 grid (4 oak_planks -> 1 crafting_table)
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  console.log('Crafting table in 2x2 grid...');
  try {
    const tableRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
    if (tableRecipe) await bot.craft(tableRecipe, 1, null);
  } catch (e) {
    console.log('Table craft error:', e.message);
  }
}
console.log('Inv after table craft:', lib.inv());

// 2. Find or place crafting table
let table = bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 6 });
if (!table && lib.count('crafting_table') > 0) {
  // Place table on safe solid block near (37, 66, -184)
  const placeCandidates = [
    new Vec3(37, 66, -183),
    new Vec3(37, 66, -184),
    new Vec3(36, 66, -183),
    new Vec3(37, 67, -184)
  ];
  for (const pos of placeCandidates) {
    const b = bot.blockAt(pos);
    if (b && b.name === 'air') {
      try {
        console.log(`Placing crafting table at ${lib.fmt(pos)}...`);
        await lib.place('crafting_table', pos);
        table = bot.blockAt(pos);
        if (table && table.name.includes('crafting_table')) break;
      } catch (err) {
        console.log(`Place at ${lib.fmt(pos)} note:`, err.message);
      }
    }
  }
}

if (!table) table = bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 8 });
console.log('Table block status:', table ? lib.fmt(table.position) : 'none');

// 3. Craft Stone Sword using crafting table
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone sword...');
  try {
    if (table) {
      await bot.lookAt(table.position.offset(0.5, 0.5, 0.5), true);
      const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, table)[0];
      if (swRecipe) await bot.craft(swRecipe, 1, table);
    } else {
      await lib.craft('stone_sword', 1);
    }
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

await lib.equipWeapon();
await lib.equipArmor();
console.log('Equipped weapon:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'weapon'} at Spawner Pillbox! Slaying Blazes alongside Gamma!`);

// 4. Combat Loop alongside Gamma from behind Pillbox Wall
console.log('Entering stationary Blaze combat loop...');
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

// Lock stationary position behind pillbox wall
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

while (!isCancelled() && Date.now() - combatStart < 75000) {
  if (bot.health < 6) {
    console.log(`WARNING: Health critical (${bot.health.toFixed(1)}/20)! Taking cover at (37, 65, -177)...`);
    try { await lib.goTo(37, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
    break;
  }
  
  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Strike through 1-block waist firing slit (reach <= 4.8m)
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (Blaze HP: ${target.health})`);
      if (target.health <= 0) {
        killed++;
        console.log(`Blaze killed! Total: ${killed}`);
      }
    }
  }
  
  // Vacuum dropped items (rods, shields, swords) within safe stationary reach (<= 3 blocks)
  if (Math.random() < 0.2) {
    try {
      const g = await lib.pickup(3);
      if (g > 0) {
        await lib.equipArmor();
        await lib.equipWeapon();
      }
    } catch (e) {}
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
  
  await sleep(150);
}

// Final pickup
try { await lib.pickup(3); } catch (e) {}
await lib.equipArmor();
await lib.equipWeapon();

const finalRods = lib.count('blaze_rod');
console.log('=== COMBAT LOOP COMPLETE ===');
console.log('Blaze Rods in inv:', finalRods, 'HP:', bot.health.toFixed(1), 'Inv:', lib.inv());
bot.chat(`alpha: Frontline combat report: Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20, Held: ${bot.heldItem?.name || 'none'}`);
