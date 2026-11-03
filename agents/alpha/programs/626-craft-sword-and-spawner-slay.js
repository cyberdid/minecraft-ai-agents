// programs/626-craft-sword-and-spawner-slay.js
console.log('=== Program 626: Craft Sword & Slay Blazes at Spawner Pillbox ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Craft crafting table in 2x2 grid if we don't have one and have >= 4 planks
if (lib.count('crafting_table') === 0 && lib.count('*_sword') === 0 && lib.count('*_planks') >= 4) {
  try {
    const ctRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
    if (ctRecipe) {
      console.log('Crafting table in 2x2 grid...');
      await bot.craft(ctRecipe, 1, null);
    }
  } catch (e) {
    console.log('Craft table 2x2 error:', e.message);
  }
}

// 2. If we have crafting_table and planks >= 2, craft a wooden sword
if (lib.count('*_sword') === 0 && lib.count('crafting_table') > 0 && lib.count('*_planks') >= 2 && lib.count('stick') >= 1) {
  try {
    // Find a solid block next to us to place crafting table against
    const p = bot.entity.position.floored();
    const placePos = p.offset(0, 0, -1);
    const floorBlock = bot.blockAt(p.offset(0, -1, -1));
    if (floorBlock && floorBlock.boundingBox === 'block' && bot.blockAt(placePos).name === 'air') {
      const ctItem = bot.inventory.items().find(i => i.name === 'crafting_table');
      if (ctItem) {
        await bot.equip(ctItem, 'hand');
        await bot.placeBlock(floorBlock, new Vec3(0, 1, 0));
        console.log('Placed crafting table at', lib.fmt(placePos));
        await sleep(300);
        const ctBlock = bot.blockAt(placePos);
        if (ctBlock && ctBlock.name === 'crafting_table') {
          const wsRecipe = bot.recipesFor(mcData.itemsByName.wooden_sword.id, null, 1, ctBlock)[0];
          if (wsRecipe) {
            await bot.craft(wsRecipe, 1, ctBlock);
            console.log('Crafted wooden_sword!');
          }
          // Dig it back
          await bot.dig(ctBlock);
          await sleep(300);
          try { await lib.pickup(2); } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.log('Craft sword error:', e.message);
  }
}

await lib.equipWeapon();
console.log('Held weapon before advancing:', bot.heldItem?.name);

// 3. Fast-march remaining waypoints to Spawner Balcony Pillbox at (36, 67, -185)
const waypoints = [
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174),
  new Vec3(37, 65, -177),
  new Vec3(36, 67, -185)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
  
  // Vacuum drops along the way (Delta's drops)
  try {
    const picked = await lib.pickup(3);
    if (picked > 0) console.log(`Picked up ${picked} drops at WP!`);
  } catch (e) {}
}

// 4. Arrived at Spawner Balcony Pillbox: Lock stationary position!
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
console.log('LOCKED at Spawner Pillbox! Pos:', lib.fmt(bot.entity.position));

// Vacuum drops at pillbox
try {
  const frontDrops = await lib.pickup(5);
  console.log(`Vacuumed ${frontDrops} frontline drops!`);
} catch (e) {}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name, 'Inv:', lib.inv());
bot.chat(`alpha: Locked behind pillbox wall! Weapon: ${bot.heldItem?.name || 'none'}, Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Rods: ${lib.count('blaze_rod')}/8`);

// 5. Stationary Blaze combat loop through firing slit
console.log('Starting stationary Blaze combat loop...');
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - combatStart < 60000) {
  if (bot.health < 6) {
    console.log(`Health low (${bot.health.toFixed(1)}/20)! Tactical cover at (37, 65, -177)...`);
    try { await lib.goTo(37, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
    break;
  }
  
  // Target nearest Blaze
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
        console.log(`Blaze killed! Total: ${killed}`);
      }
    }
  }
  
  // Vacuum dropped rods/items within stationary reach
  if (Math.random() < 0.25) {
    try { await lib.pickup(3); } catch (e) {}
  }
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! ${currentRods} Blaze Rods harvested! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(150);
}

// Final pickup
try { await lib.pickup(4); } catch (e) {}
const finalRods = lib.count('blaze_rod');
console.log('Pillbox combat complete! Blaze Rods:', finalRods, 'HP:', bot.health.toFixed(1));
bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
