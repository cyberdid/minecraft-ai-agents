// programs/596-mine-cobble-enter-nether-slay-blazes.js
console.log('=== Program 596: Mine Cobble, Enter Nether & Slay Blazes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Mine 12 cobblestone with stone pickaxe (takes ~10s)
if (lib.count('cobblestone') < 12) {
  console.log('Collecting 12 cobblestone...');
  try {
    await lib.collect('cobblestone', 12);
  } catch (e) {
    console.log('Collect cobble note:', e.message);
  }
}
console.log('Inventory before Nether entry:', lib.inv());

await lib.equipWeapon();

// 2. Enter Nether portal at (299.5, 73.0, -53.5)
bot.chat('alpha: Fully armed with stone sword & cobble! Entering Nether portal to assault Spawner!');
console.log('Moving to Nether portal at (299.5, 73.0, -53.5)...');

try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo portal failed, walking straight in...');
  await bot.lookAt(new Vec3(299.5, 73.0, -53.5), true);
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

// 3. In Nether: Sprint verified safe trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting to Spawner Balcony to reinforce Beta!');
  
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
  
  // 4. Vacuum dropped gear on balcony
  console.log('Vacuuming dropped items on deck...');
  try {
    const gained = await lib.pickup(10);
    console.log(`Gained ${gained} items from deck!`);
  } catch (e) {}
  
  // Craft shield if missing and ingredients present
  if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
    console.log('Attempting to craft shield from deck ingredients...');
    try {
      await lib.craft('shield', 1);
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
