// programs/604-ascend-quarry-and-enter-nether.js
console.log('=== Program 604: Ascend Quarry, Enter Nether & Slay Blazes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Ascend quarry staircase to surface at (302, 71, -44)
console.log('Ascending quarry staircase to surface at (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 1.5, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo surface note:', e.message);
  await bot.lookAt(new Vec3(302, 71, -44), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(3000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

console.log('Surface reached! Pos:', lib.fmt(bot.entity.position));

// 2. Move to portal approach at (299.5, 72.0, -52.0)
console.log('Moving to portal approach at (299.5, 72.0, -52.0)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('goTo portal approach note:', e.message);
}

console.log('At portal approach! Pos:', lib.fmt(bot.entity.position));

// 3. Step up onto sill and stand inside portal block at (299.5, 73.0, -54.0)
console.log('Jumping into portal block at (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Position inside portal block:', lib.fmt(bot.entity.position));
bot.chat('alpha: Inside Nether portal block! Awaiting warp to reinforce team at Spawner!');

// Await Nether dimension change (hold position inside purple block)
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 25000 && !isCancelled()) {
  if (bot.entity.position.y < 72.8 || Math.abs(bot.entity.position.z - (-54.0)) > 0.5) {
    await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 4. In Nether: Sprint safe trail to Spawner Balcony Upper Deck (y=68)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast-marching to Spawner Balcony Upper Deck at y=68 to join Beta, Delta & Gamma!');
  
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
    new Vec3(37, 68, -184)  // Upper Deck at y=68!
  ];
  
  for (let i = 0; i < safeTrail.length; i++) {
    if (isCancelled()) break;
    const wp = safeTrail[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${safeTrail.length}: ${lib.fmt(wp)}...`);
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
  
  console.log('Arrived at Spawner Balcony Upper Deck! Pos:', lib.fmt(bot.entity.position));
  
  // 5. Fortify Upper Deck Pillbox: Backstop Wall to prevent knockback
  if (lib.count('cobblestone') >= 2) {
    try {
      const bBack1 = bot.blockAt(new Vec3(38, 68, -184));
      if (bBack1 && bBack1.name === 'air') {
        console.log('Placing backstop wall at (38, 68, -184)...');
        await lib.place('cobblestone', 38, 68, -184);
      }
      const bBack2 = bot.blockAt(new Vec3(38, 69, -184));
      if (bBack2 && bBack2.name === 'air') {
        console.log('Placing backstop wall at (38, 69, -184)...');
        await lib.place('cobblestone', 38, 69, -184);
      }
    } catch (e) {}
  }
  
  // Vacuum dropped items
  console.log('Vacuuming dropped items...');
  try {
    const gained = await lib.pickup(6);
    console.log(`Gained ${gained} items!`);
  } catch (e) {}
  
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Inventory at front:', lib.inv());
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  
  // 6. Stationary Combat Loop from behind backstop wall
  console.log('Starting stationary Blaze combat loop...');
  const anchorPos = new Vec3(37, 68, -184);
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let rounds = 0;
  
  while (Date.now() - combatStart < 75000 && !isCancelled() && bot.health > 4) {
    if (bot.entity.position.distanceTo(anchorPos) > 2.0) {
      await bot.lookAt(anchorPos, true);
      bot.setControlState('forward', true);
      await sleep(400);
      bot.setControlState('forward', false);
    }
    
    await lib.equipWeapon();
    await lib.equipArmor();
    
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
  console.log('Final Blaze Rods in inv:', finalRods);
  bot.chat(`alpha: Spawner engagement round complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
}
