// programs/612-speed-rearm-and-pillbox-assault.js
console.log('=== Program 612: Speed Re-arm & Enclosed Pillbox Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Exit base door at (294, 72, -54)
console.log('Exiting base door...');
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

// 2. Gather 2 logs from nearest tree
if (lib.count('*_log') === 0 && lib.count('*pickaxe') === 0) {
  console.log('Collecting 2 logs...');
  try {
    await lib.collect('*_log', 2);
  } catch (e) {
    console.log('Log collect note:', e.message);
  }
}

// Convert all logs to planks
for (const it of bot.inventory.items()) {
  if (it.name.endsWith('_log')) {
    const pName = it.name.replace('_log', '_planks');
    try { await lib.craft(pName, it.count * 4); } catch (e) {}
  }
}

// Sticks
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Table
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Wooden pickaxe
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// 3. Mine cobblestone at safe surface quarry
console.log('Moving to surface quarry at (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 6000 });
} catch (e) {}

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
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'sword'} & ${lib.count('cobblestone')} cobble! Heading into Nether portal!`);

// 4. Ascend to surface if in quarry
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

// Move to portal approach and jump into portal block
console.log('Moving to portal approach at (299.5, 72.0, -52.0)...');
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

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
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

// 5. In Nether: Sprint safe trail to Spawner Balcony Upper Deck (y=68)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast-marching to Spawner Balcony Upper Deck at y=68 to recover gear & slay Blazes!');
  
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
  
  const safeTrail = [
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
    new Vec3(37, 68, -184)
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
  
  // 6. Fortify 4-walled pillbox around (37, 68, -184) to eliminate knockback falls
  if (lib.count('cobblestone') >= 4) {
    try {
      // Back wall at (38, 68..69, -184)
      const b1 = bot.blockAt(new Vec3(38, 68, -184));
      if (b1 && b1.name === 'air') await lib.place('cobblestone', 38, 68, -184);
      const b2 = bot.blockAt(new Vec3(38, 69, -184));
      if (b2 && b2.name === 'air') await lib.place('cobblestone', 38, 69, -184);
      
      // Front wall at (36, 68, -184)
      const f1 = bot.blockAt(new Vec3(36, 68, -184));
      if (f1 && f1.name === 'air') await lib.place('cobblestone', 36, 68, -184);
      
      // Side wall at (37, 68, -183)
      const s1 = bot.blockAt(new Vec3(37, 68, -183));
      if (s1 && s1.name === 'air') await lib.place('cobblestone', 37, 68, -183);
    } catch (e) {
      console.log('Fortification note:', e.message);
    }
  }
  
  // Equip shield & weapon (picked up automatically or carried)
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Inventory at front:', lib.inv());
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  
  // 7. Stationary Combat Loop (STAY COMPLETELY STILL INSIDE BUNKER)
  console.log('Starting stationary Blaze combat loop from bunker...');
  bot.clearControlStates();
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  
  while (Date.now() - combatStart < 75000 && !isCancelled() && bot.health > 4) {
    bot.clearControlStates();
    await lib.equipWeapon();
    await lib.equipArmor();
    
    // Find Blazes within 5.5 blocks
    const blazes = Object.values(bot.entities).filter(
      e => e.name === 'blaze' && e.isValid && e.position.distanceTo(bot.entity.position) < 5.8
    ).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));
    
    if (blazes.length > 0) {
      const target = blazes[0];
      console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist ${target.position.distanceTo(bot.entity.position).toFixed(1)}m)...`);
      await bot.lookAt(target.position.offset(0, 1.0, 0), true);
      bot.attack(target);
      await sleep(450);
      if (target.isValid && target.position.distanceTo(bot.entity.position) < 5.8) {
        bot.attack(target);
        await sleep(450);
      }
    } else {
      await sleep(400);
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
