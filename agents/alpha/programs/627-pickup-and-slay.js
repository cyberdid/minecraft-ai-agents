// programs/627-pickup-and-slay.js
console.log('=== Program 627: Frontline Pickup, Craft & Blaze Slay ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Vacuum all drops within 6m (Delta/Gamma/previous drops)
console.log('Vacuuming dropped items...');
try {
  const gained = await lib.pickup(6);
  console.log(`Picked up ${gained} items!`);
} catch (e) {
  console.log('Pickup note:', e.message);
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Inventory after pickup:', lib.inv());
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// 2. If we don't have a sword but have cobble and stick, craft stone sword
if (lib.count('*_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone sword...');
  try {
    // Check if crafting table in inv, if not craft one in 2x2
    if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
      const ctRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
      if (ctRecipe) await bot.craft(ctRecipe, 1, null);
    }
    
    // Find or place crafting table
    let table = bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 4 });
    if (!table && lib.count('crafting_table') > 0) {
      const p = bot.entity.position.floored();
      // Place against solid floor block
      const floor = bot.blockAt(p.offset(1, -1, 0));
      if (floor && floor.boundingBox === 'block' && bot.blockAt(p.offset(1, 0, 0)).name === 'air') {
        const ctItem = bot.inventory.items().find(i => i.name === 'crafting_table');
        await bot.equip(ctItem, 'hand');
        await bot.placeBlock(floor, new Vec3(0, 1, 0));
        await sleep(300);
        table = bot.blockAt(p.offset(1, 0, 0));
      }
    }
    
    if (table) {
      const ssRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, table)[0];
      if (ssRecipe) {
        await bot.craft(ssRecipe, 1, table);
        console.log('Stone sword crafted successfully!');
      }
    }
  } catch (err) {
    console.log('Craft stone sword error:', err.message);
  }
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear - Weapon:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);
bot.chat(`alpha: Stationed at Pillbox (36, 66, -184)! Weapon: ${bot.heldItem?.name || 'none'}, Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Rods: ${lib.count('blaze_rod')}/8`);

// 3. Lock stationary position at pillbox
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 4. Combat Loop from cover
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - combatStart < 45000) {
  if (bot.health < 6) {
    console.log(`Health low (${bot.health.toFixed(1)}/20)! Moving 3 blocks back to roofed corridor (37, 65, -177)...`);
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
    if (dist <= 4.8 && Date.now() - lastAttack > 600) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (HP: ${target.health})`);
      if (target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total killed: ${killed}`);
      }
    }
  }
  
  // Vacuum nearby drops
  if (Math.random() < 0.25) {
    try { await lib.pickup(4); } catch (e) {}
  }
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
    bot.chat(`alpha: Harvested Blaze Rod! Total in inv: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! ${currentRods} Blaze Rods harvested! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(150);
}

// Final pickup
try { await lib.pickup(5); } catch (e) {}
const finalRods = lib.count('blaze_rod');
console.log('Combat engagement complete. Total Blaze Rods:', finalRods, 'HP:', bot.health.toFixed(1));
bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
