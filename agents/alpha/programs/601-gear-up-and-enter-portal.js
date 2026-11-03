// programs/601-gear-up-and-enter-portal.js
console.log('=== Program 601: Gear Up, Portal Jump & Pillbox Blaze Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Gather 2 logs
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

// Ensure sticks
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Ensure crafting table
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Ensure wooden pickaxe
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

console.log('Inventory after basic tools:', lib.inv());

// 2. Mine cobblestone for stone tools
if (lib.count('cobblestone') < 5 && lib.count('*pickaxe') > 0) {
  console.log('Mining 5 cobblestone for stone tools...');
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

// Craft stone sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  console.log('Crafting stone sword...');
  if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

// Mine 16 building cobblestone
if (lib.count('*pickaxe') > 0 && lib.count('cobblestone') < 16) {
  console.log('Mining 16 building cobblestone...');
  try { await lib.collect('cobblestone', 16); } catch (e) {}
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv(), 'Held:', bot.heldItem?.name);
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'sword'} & ${lib.count('cobblestone')} cobble! Approaching portal!`);

// 3. Move to portal approach and step inside
console.log('Moving to portal approach at (299.5, 72.0, -52.0)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 10000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 72.0, -52.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Jump up onto obsidian sill and step into portal block at (299.5, 73.5, -53.5)
console.log('Jumping into portal block at (299.5, 73.5, -53.5)...');
await bot.lookAt(new Vec3(299.5, 73.5, -53.5), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 25000 && !isCancelled()) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 4. In Nether: Sprint safe trail to Spawner Balcony Upper Deck (y=68)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast-marching to Spawner Balcony Upper Deck at y=68 to reinforce Beta & Delta!');
  
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
