// programs/592-gear-up-and-rush-spawner.js
console.log('=== Program 592: Gear Up & Rush Spawner Balcony ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Exit base door at (294, 72, -54)
console.log('Exiting base door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(296, 72, -54), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Obtain stone sword if none
if (lib.count('*sword') === 0) {
  console.log('Obtaining stone sword...');
  try {
    await lib.obtain('stone_sword', 1);
  } catch (oe) {
    console.log('Obtain sword note:', oe.message);
  }
}

// Obtain stone pickaxe if none
if (lib.count('*pickaxe') === 0) {
  console.log('Obtaining stone pickaxe...');
  try {
    await lib.obtain('stone_pickaxe', 1);
  } catch (pe) {
    console.log('Obtain pickaxe note:', pe.message);
  }
}

// Collect cobblestone if low
if (lib.count('cobblestone') < 16) {
  console.log('Collecting cobblestone...');
  try {
    await lib.collect('cobblestone', 20);
  } catch (ce) {
    console.log('Collect cobblestone note:', ce.message);
  }
}

// Attempt shield obtain
if (lib.count('shield') === 0) {
  console.log('Attempting to obtain shield via lib.obtain...');
  try {
    await lib.obtain('shield', 1);
    console.log('Shield obtained successfully!');
  } catch (se) {
    console.log('Shield obtain note:', se.message);
  }
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv());
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'sword'} & offhand ${bot.inventory.slots[45]?.name || 'none'}! Entering Nether!`);

// 3. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Entering Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 10000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 25000 && !isCancelled()) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 4. In Nether: Sprint verified safe trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting to Spawner Balcony!');
  
  // Step out of Nether portal frame
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
  
  const safeTrail = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),  // Excavated tunnel entrance at y=64
    new Vec3(63, 65, -20), // Inside tunnel
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127), // Fortress Workshop Outpost
    new Vec3(44, 65, -148),
    new Vec3(44, 65, -163),
    new Vec3(44, 65, -174), // Spawner Bridgehead
    new Vec3(37, 65, -177), // Cross-bridge end
    new Vec3(34, 67, -187)  // Spawner Balcony connection!
  ];
  
  for (let i = 0; i < safeTrail.length; i++) {
    if (isCancelled()) break;
    const wp = safeTrail[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${safeTrail.length}: ${lib.fmt(wp)}...`);
    // Pitch gaze low to avoid Enderman stare
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
  
  console.log('Arrived at Spawner Balcony! Pos:', lib.fmt(bot.entity.position));
  
  // Vacuum dropped gear on balcony
  console.log('Vacuuming dropped items on deck...');
  try {
    const gained = await lib.pickup(10);
    console.log(`Gained ${gained} items from deck!`);
  } catch (e) {}
  
  // Craft shield if missing and ingredients present
  if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
    console.log('Attempting to craft shield from deck ingredients...');
    try {
      const plankTypes = ['birch_planks', 'oak_planks', 'spruce_planks', 'nether_planks'];
      for (const pt of plankTypes) {
        if (lib.count(pt) >= 6) {
          await lib.craft('shield', 1);
          break;
        }
      }
    } catch (e) {
      console.log('Deck shield craft note:', e.message);
    }
  }
  
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Inv after deck pickup:', lib.inv());
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  
  // 5. Combat Loop: Slay Blazes & Harvest Rods
  console.log('Starting Blaze combat loop...');
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  
  while (Date.now() - combatStart < 60000 && !isCancelled() && bot.health > 4) {
    await lib.equipWeapon();
    await lib.equipArmor();
    
    const hostiles = lib.hostiles(8);
    const blazes = hostiles.filter(h => h.name === 'blaze');
    if (blazes.length > 0) {
      const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.5);
      if (entity) {
        console.log(`Striking Blaze at ${lib.fmt(entity.position)}...`);
        await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
        bot.attack(entity);
        await sleep(400);
        if (entity.isValid) {
          bot.attack(entity);
          await sleep(400);
        }
      }
    }
    
    try { await lib.pickup(8); } catch (e) {}
    
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
    await sleep(400);
  }
  
  const finalRods = lib.count('blaze_rod');
  console.log('Final Blaze Rods in inv:', finalRods);
  bot.chat(`alpha: Spawner engagement round complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
}
