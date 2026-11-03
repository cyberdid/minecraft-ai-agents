// programs/616-complete-milestone-8.js
console.log('=== Program 616: Complete Milestone 8 (Blaze Rod Harvest) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Gather 1-2 logs if needed
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') < 3 && lib.count('*_log') === 0) {
  console.log('Collecting 2 logs from nearby trees...');
  try { await lib.collect('*_log', 2); } catch (e) {}
}

// Convert logs to planks
for (const it of bot.inventory.items()) {
  if (it.name.endsWith('_log')) {
    const pName = it.name.replace('_log', '_planks');
    try { await lib.craft(pName, it.count * 4); } catch (e) {}
  }
}

// Ensure sticks
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Craft wooden pickaxe
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// 2. Mine cobblestone for stone tools
if (lib.count('cobblestone') < 5 && lib.count('*pickaxe') > 0) {
  console.log('Mining initial 5 cobblestone...');
  try { await lib.collect('cobblestone', 5); } catch (e) {}
}

// Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  console.log('Crafting stone pickaxe...');
  if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

// Craft 2 stone swords
while (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 2) {
  console.log('Crafting stone sword...');
  if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  try { await lib.craft('stone_sword', 1); } catch (e) { break; }
}

// Mine 16 building cobblestone
if (lib.count('*pickaxe') > 0 && lib.count('cobblestone') < 16) {
  console.log('Mining 16 building cobblestone...');
  try { await lib.collect('cobblestone', 16); } catch (e) {}
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv(), 'Held:', bot.heldItem?.name);
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'sword'} & ${lib.count('cobblestone')} cobble! Approaching portal!`);

// 3. Ascend to surface if in quarry
if (bot.entity.position.y < 70) {
  console.log('Ascending to surface at (302, 71, -44)...');
  try {
    await lib.goTo(302, 71, -44, 1.5, { timeoutMs: 10000 });
  } catch (e) {
    await bot.lookAt(new Vec3(302, 71, -44), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(2000);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
}

// Step into Nether portal at (298.5, 73.0, -54.0)
console.log('Moving to portal approach at (299.5, 72.0, -52.0)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 72.0, -52.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Jumping into portal block at (298.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 25000 && !isCancelled()) {
  if (bot.entity.position.y < 72.8 || Math.abs(bot.entity.position.z - (-54.0)) > 0.5) {
    await bot.lookAt(new Vec3(298.5, 73.0, -54.0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 4. In Nether: Sprint safe trail to Spawner Balcony Pillbox at (36, 67, -185)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast-marching to Spawner Balcony Pillbox at (36, 67, -185) to claim Milestone 8!');
  
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
  
  const waypoints = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),   // Tunnel entrance
    new Vec3(63, 65, -20),  // Inside tunnel
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
    new Vec3(37, 65, -177), // Cross-bridge under roof
    new Vec3(36, 67, -185)  // Spawner Balcony Pillbox!
  ];
  
  for (let i = 0; i < waypoints.length; i++) {
    if (isCancelled()) break;
    const wp = waypoints[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)} (pos: ${lib.fmt(bot.entity.position)})`);
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
  
  console.log('Arrived at Spawner Balcony Pillbox! Pos:', lib.fmt(bot.entity.position));
  
  // 5. Stationary Safety & Drop Recovery
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  
  // Vacuum dropped items at pillbox (recovers shield, weapons, rods)
  try {
    const gained = await lib.pickup(4);
    if (gained > 0) console.log(`Picked up ${gained} drops from pillbox!`);
  } catch (e) {}
  
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Inventory at front:', lib.inv());
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  
  // 6. Stationary Combat Loop from behind pillbox wall
  console.log('Beginning stationary Blaze combat loop...');
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;
  
  while (!isCancelled() && Date.now() - combatStart < 60000) {
    // If health drops below 6, retreat under roof
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
      if (dist <= 4.8 && Date.now() - lastAttack > 600) {
        await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (Blaze HP: ${target.health})`);
        if (target.health <= 0) {
          killed++;
          console.log(`Blaze eliminated! Total killed: ${killed}`);
        }
      }
    }
    
    // Vacuum drops within stationary reach
    if (Math.random() < 0.2) {
      try { await lib.pickup(3); } catch (e) {}
    }
    
    const currentRods = lib.count('blaze_rod');
    if (currentRods !== lastRods) {
      console.log(`+++ BLAZE ROD HARVESTED! Total rods: ${currentRods} +++`);
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
  try { await lib.pickup(4); } catch (e) {}
  
  const finalRods = lib.count('blaze_rod');
  console.log('Final Blaze Rods in inv:', finalRods, 'HP:', bot.health.toFixed(1));
  bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
}
