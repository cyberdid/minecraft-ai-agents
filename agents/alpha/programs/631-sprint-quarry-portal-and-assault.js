// programs/631-sprint-quarry-portal-and-assault.js
console.log('=== Program 631: Sprint to Quarry, Arm & Nether Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
console.log('Time info:', lib.time());

// 1. Sprint West to surface quarry at (302, 71, -44)
console.log('Sprinting to surface quarry at (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 30000 });
} catch (e) {
  console.log('lib.goTo note:', e.message);
  await bot.lookAt(new Vec3(302.5, 71.0, -44.5), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(10000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
}

console.log('Arrived near quarry! Pos:', lib.fmt(bot.entity.position));

// 2. Craft wooden pickaxe using table at (302, 69, -44)
const tableBlock = bot.blockAt(new Vec3(302, 69, -44)) || bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 15 });
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try {
    if (tableBlock) {
      await lib.goTo(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 2, { timeoutMs: 6000 });
      const wp = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
      if (wp) await bot.craft(wp, 1, tableBlock);
    } else {
      await lib.craft('wooden_pickaxe', 1);
    }
  } catch (e) {
    console.log('Wooden pick note:', e.message);
  }
}

// 3. Mine 6 stone/cobblestone at quarry
if (lib.count('*pickaxe') > 0 && lib.count('cobblestone') < 6) {
  console.log('Mining 6 stone/cobblestone at quarry...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 6000 });
    await lib.collect(['stone', 'cobblestone'], 6, { timeoutMs: 20000 });
  } catch (e) {
    console.log('Collect stone note:', e.message);
  }
}

// 4. Craft stone sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone sword...');
  try {
    const table = bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 15 });
    if (table) {
      await lib.goTo(table.position.x, table.position.y, table.position.z, 2, { timeoutMs: 5000 });
      const sw = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, table)[0];
      if (sw) await bot.craft(sw, 1, table);
    }
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Weapon equipped:', bot.heldItem?.name, 'Inv:', lib.inv());
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'tools'} & ${lib.count('cobblestone')} cobble! Heading to Nether portal!`);

// 5. Jump into Nether portal at (299.5, 73.0, -54.0)
console.log('Moving to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 72.0, -52.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Jumping into portal block at (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

// Await Nether warp
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  if (bot.entity.position.y < 72.8 || Math.abs(bot.entity.position.z - (-54.0)) > 0.5 || Math.abs(bot.entity.position.x - 299.5) > 0.8) {
    await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(250);
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 6. In Nether: Fast-march 16 waypoints to Spawner Balcony Pillbox at (36, 67, -185)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast-marching 16 waypoints to Spawner Pillbox to reinforce team!');
  
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
  
  const waypoints = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),
    new Vec3(63, 65, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127),
    new Vec3(44, 65, -148),
    new Vec3(44, 65, -163),
    new Vec3(44, 65, -174),
    new Vec3(37, 65, -177),
    new Vec3(36, 67, -185)
  ];
  
  for (let i = 0; i < waypoints.length; i++) {
    if (isCancelled()) break;
    const wp = waypoints[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 10000 });
    } catch (err) {
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      await sleep(1200);
      bot.setControlState('forward', false);
      bot.setControlState('sprint', false);
    }
  }
  
  // Arrived at Spawner Balcony Pillbox!
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  console.log('Arrived at Spawner Pillbox! Pos:', lib.fmt(bot.entity.position));
  
  // Scoop frontline drops (recovering shields, weapons, cobblestone, rods)
  try {
    const gained = await lib.pickup(4);
    console.log(`Vacuumed ${gained} items! Current inv:`, lib.inv());
  } catch (e) {}
  
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  bot.chat(`alpha: Locked at Spawner Pillbox! Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Weapon: ${bot.heldItem?.name || 'none'}, Rods: ${lib.count('blaze_rod')}/8`);
  
  // 7. Stationary Blaze combat loop from behind pillbox wall
  console.log('Beginning stationary combat loop...');
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;
  
  while (!isCancelled() && Date.now() - combatStart < 55000) {
    if (bot.health < 6) {
      console.log(`Health low (${bot.health.toFixed(1)}/20)! Retreating under roof at (37, 65, -177)...`);
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
    
    // Vacuum drops within safe stationary reach
    if (Math.random() < 0.25) {
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
  
  // Final pickup & equip
  try { await lib.pickup(4); } catch (e) {}
  await lib.equipArmor();
  await lib.equipWeapon();
  
  const finalRods = lib.count('blaze_rod');
  console.log('Combat finished! Blaze Rods:', finalRods, 'HP:', bot.health.toFixed(1));
  bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
}
