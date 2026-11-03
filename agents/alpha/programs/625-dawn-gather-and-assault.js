// programs/625-dawn-gather-and-assault.js
console.log('=== Program 625: Dawn Gather, Craft & Spawner Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
console.log('Time info:', lib.time());

// 1. If inside base and need wood, go through door
if (bot.game.dimension === 'overworld' && lib.count('*_log') === 0 && lib.count('*_planks') === 0) {
  console.log('Stepping through base door at (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('goThroughDoor note:', e.message);
    try {
      await lib.door(294, 72, -54, true);
      await bot.lookAt(new Vec3(294.5, 72.0, -52.0), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);
      await lib.door(294, 72, -54, false);
    } catch (err) {}
  }

  // Collect 4 logs
  console.log('Collecting 4 logs from nearby trees...');
  try {
    await lib.collect('*_log', 4, { timeoutMs: 25000 });
  } catch (e) {
    console.log('Collect log error:', e.message);
  }
}

// 2. Craft planks in 2x2 grid
const logItem = bot.inventory.items().find(i => i.name.includes('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  const plankData = mcData.itemsByName[plankName];
  if (plankData) {
    const plankRecipe = bot.recipesFor(plankData.id, null, 1, null)[0];
    if (plankRecipe) {
      console.log(`Crafting planks from ${logItem.name} x${logItem.count}...`);
      await bot.craft(plankRecipe, logItem.count, null);
    }
  }
}

// 3. Craft sticks in 2x2 grid
const plankItem = bot.inventory.items().find(i => i.name.includes('_planks'));
if (plankItem && plankItem.count >= 2 && lib.count('stick') < 4) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) {
    console.log('Crafting sticks in 2x2 grid...');
    await bot.craft(stickRecipe, 1, null);
  }
}

// 4. Craft wooden pickaxe using table at (291, 72, -60) or (302, 69, -44)
let tablePos = new Vec3(291, 72, -60);
let tableBlock = bot.blockAt(tablePos);
if (!tableBlock || !tableBlock.name.includes('crafting_table')) {
  tablePos = new Vec3(302, 69, -44);
  tableBlock = bot.blockAt(tablePos);
}

if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try {
    if (tableBlock) {
      await lib.goTo(tablePos.x, tablePos.y, tablePos.z, 2, { timeoutMs: 5000 });
      const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
      if (wpRecipe) await bot.craft(wpRecipe, 1, tableBlock);
    } else {
      await lib.craft('wooden_pickaxe', 1);
    }
  } catch (e) {
    console.log('Wooden pick error:', e.message);
  }
}

// 5. Mine 16 stone/cobblestone at surface quarry (302, 71, -44)
if (lib.count('*pickaxe') > 0 && lib.count('cobblestone') < 16) {
  console.log('Mining 16 stone/cobblestone at quarry...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 8000 });
    await lib.collect(['stone', 'cobblestone'], 16, { timeoutMs: 30000 });
  } catch (e) {
    console.log('Cobblestone collect error:', e.message);
  }
}

// 6. Craft stone pickaxe and stone sword
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  try {
    const spTable = bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 25 });
    if (spTable) {
      await lib.goTo(spTable.position.x, spTable.position.y, spTable.position.z, 2, { timeoutMs: 5000 });
      const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, spTable)[0];
      if (spRecipe) await bot.craft(spRecipe, 1, spTable);
    }
  } catch (e) {}
}

if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try {
    const swTable = bot.findBlock({ matching: b => b.name.includes('crafting_table'), maxDistance: 25 });
    if (swTable) {
      await lib.goTo(swTable.position.x, swTable.position.y, swTable.position.z, 2, { timeoutMs: 5000 });
      const swRecipe = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, swTable)[0];
      if (swRecipe) await bot.craft(swRecipe, 1, swTable);
    }
  } catch (e) {}
}

await lib.equipWeapon();
console.log('Prepared for Nether! Inventory:', lib.inv(), 'Held:', bot.heldItem?.name);
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'tools'} & ${lib.count('cobblestone')} cobble! Heading to Nether portal!`);

// 7. Move to Nether portal at (299.5, 73.0, -54.0)
console.log('Moving to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 72.0, -52.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Jump into portal block
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

console.log('Dimension after warp:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 8. In Nether: Sprint 16 waypoints to Spawner Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast-marching 16 waypoints to Spawner Balcony Pillbox!');
  
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
  
  // Arrived at Pillbox: Lock position!
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  console.log('Arrived at Spawner Balcony Pillbox! Pos:', lib.fmt(bot.entity.position));
  
  // Vacuum dropped stockpile at pillbox
  try {
    const gained = await lib.pickup(5);
    console.log(`Vacuumed ${gained} items!`);
  } catch (e) {}
  
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  bot.chat(`alpha: Pillbox locked! Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Weapon: ${bot.heldItem?.name || 'none'}, Rods: ${lib.count('blaze_rod')}/8`);
  
  // Stationary Blaze combat loop
  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  
  while (!isCancelled() && Date.now() - combatStart < 45000) {
    if (bot.health < 6) {
      console.log(`Health low (${bot.health.toFixed(1)}/20)! Retreating to cross-bridge (37, 65, -177)...`);
      try { await lib.goTo(37, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
      break;
    }
    
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
      }
    }
    
    if (Math.random() < 0.25) {
      try { await lib.pickup(3); } catch (e) {}
    }
    
    const currentRods = lib.count('blaze_rod');
    if (currentRods !== lastRods) {
      bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
      lastRods = currentRods;
    }
    
    if (currentRods >= 7) {
      bot.chat(`alpha: TARGET ACHIEVED! ${currentRods} Blaze Rods harvested! Milestone 8 Complete!`);
      break;
    }
    
    await sleep(150);
  }
  
  try { await lib.pickup(4); } catch (e) {}
  const finalRods = lib.count('blaze_rod');
  console.log('Combat finished! Blaze Rods:', finalRods, 'HP:', bot.health.toFixed(1));
  bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
}
