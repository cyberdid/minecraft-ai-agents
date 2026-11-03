// programs/627-craft-sword-eat-and-slay-blazes.js
console.log('=== Program 627: Craft Stone Sword, Eat & Slay Blazes for Milestone 8 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Eat food if hungry ---
if (bot.food < 15 && lib.count('porkchop') > 0) {
  console.log('Eating porkchop...');
  try {
    await lib.eat('porkchop');
    console.log('Ate porkchop! Current food:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// --- Phase 2: Craft Crafting Table & Stone Sword ---
console.log('--- Phase 2: Crafting Crafting Table & Stone Sword ---');
// 2a. Craft crafting table from 4 birch planks
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    console.log('Crafted crafting table!');
  } catch (e) {
    console.log('Craft table note:', e.message);
  }
}

// 2b. Place crafting table behind us in corridor at (36, 67, -184)
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!ct && lib.count('crafting_table') >= 1) {
  console.log('Placing crafting table at (36, 67, -184)...');
  try {
    await lib.place('crafting_table', 36, 67, -184);
    ct = bot.blockAt(new Vec3(36, 67, -184));
  } catch (e) {
    console.log('Place table note:', e.message);
    try {
      const spot = await lib.freeSpot();
      await lib.place('crafting_table', spot.x, spot.y, spot.z);
    } catch (e2) {}
  }
}

// 2c. Craft stone sword
if (lib.count('stone_sword') < 1 && lib.count('cobblestone') >= 2) {
  if (lib.count('stick') < 1) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  console.log('Crafting stone sword...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted! Count:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Craft stone sword note:', e.message);
  }
}

// Equip stone sword
await lib.equipWeapon();
console.log('Armed with weapon! Held:', bot.inventory.selectedItem?.name);

// --- Phase 3: Vacuum any nearby dropped items (shield, swords, cobble) ---
console.log('Vacuuming nearby dropped items...');
await lib.pickup(6);
await lib.equipArmor();
await lib.equipWeapon();
console.log('Inv after pickup & equip:', JSON.stringify(lib.inv()));

// --- Phase 4: Slay Blazes & Harvest 7+ Blaze Rods ---
console.log('=== Phase 4: Slaying Blazes for 7+ Blaze Rods ===');
bot.chat('beta: Armed with stone sword at Spawner Balcony! Engaging Blazes for Milestone 8!');

let rounds = 0;
while (rounds < 80 && !isCancelled()) {
  rounds++;
  // Look for nearest Blaze within reach
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.8);
  if (blaze) {
    console.log(`[Round ${rounds}] Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m (HP: ${blaze.metadata?.[9] || '?'})...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(620);
  } else {
    // If no blaze in direct melee range, check for other hostiles (e.g. wither skeleton) or advance slightly
    const enemy = bot.nearestEntity(e => ['wither_skeleton', 'piglin'].includes(e.name) && bot.entity.position.distanceTo(e.position) < 4.0);
    if (enemy) {
      console.log(`Striking hostile ${enemy.name} at dist ${bot.entity.position.distanceTo(enemy.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(enemy.position.offset(0, 1.0, 0), true);
      bot.attack(enemy);
      await sleep(620);
    } else {
      await sleep(350);
    }
  }

  // Continuously scoop drops
  const gained = await lib.pickup(6);
  if (gained > 0) {
    console.log('Items gained! Current Blaze Rods:', lib.count('blaze_rod'));
  }

  // Check Milestone 8 condition
  if (lib.count('blaze_rod') >= 7) {
    console.log('====================================');
    console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
    console.log('====================================');
    bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
    break;
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
