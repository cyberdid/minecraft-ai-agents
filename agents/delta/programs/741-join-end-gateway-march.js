// programs/741-join-end-gateway-march.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 741: JOIN END GATEWAY EXPEDITION ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check Base Chest for Ender Pearls and Arrows
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && bot.game.dimension === 'overworld') {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    
    // Ender pearls for gateway teleportation
    const ep = items.find(i => i.name === 'ender_pearl');
    if (ep && lib.count('ender_pearl') < 4) {
      const take = Math.min(ep.count, 4 - lib.count('ender_pearl'));
      console.log(`Withdrawing ${take} ender_pearls from Base Chest...`);
      await chest.withdraw(ep.type, null, take);
    }
    
    // Arrows for bow
    const arr = items.find(i => i.name === 'arrow');
    if (arr && lib.count('arrow') < 8) {
      const take = Math.min(arr.count, 8 - lib.count('arrow'));
      console.log(`Withdrawing ${take} arrows...`);
      await chest.withdraw(arr.type, null, take);
    }
    
    chest.close();
  } catch (ce) {
    console.log('Chest error:', ce.message);
  }
}

// 2. Equip weapons & armor
try {
  const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
  if (ns) await bot.equip(ns, 'hand');
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
  await lib.equipArmor();
} catch (e) {}

// 3. If in Overworld Base House, exit through door
if (bot.game.dimension === 'overworld' && bot.entity.position.x < 1000) {
  if (bot.entity.position.z < -53.8) {
    try {
      console.log('Exiting Base House...');
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {}
  }

  // March to Stronghold warp trigger at (233, 70, -98)
  console.log('Marching to Stronghold warp at (233, 70, -98)...');
  bot.chat('delta: Marching from Base to Stronghold warp (233, 70, -98) to enter The End for Milestone 13!');
  
  const waypoints = [
    new Vec3(275, 71, -68),
    new Vec3(255, 70, -82),
    new Vec3(233, 70, -98)
  ];

  for (const wp of waypoints) {
    if (isCancelled() || bot.entity.position.x > 2000) break;
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
    } catch (e) {
      try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0)); } catch (e2) {}
    }
  }

  // Wait for warp to Stronghold (x > 2000)
  const warpWait = Date.now();
  while (bot.entity.position.x < 2000 && Date.now() - warpWait < 8000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Pos after overland march/warp:', lib.fmt(bot.entity.position));

// 4. In Stronghold (x > 2000), descend to active End Portal
if (bot.entity.position.x > 2000 && bot.game.dimension === 'overworld') {
  console.log('At Stronghold! Finding active End Portal...');
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(2210.0, 1.0, 1470.0, 2.0));
  } catch (pe) {}

  let portalBlock = bot.findBlock({ matching: b => b && b.name === 'end_portal', maxDistance: 12 });
  if (portalBlock) {
    console.log(`Stepping into active End Portal at ${lib.fmt(portalBlock.position)}...`);
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    const startWarp = Date.now();
    while (bot.game.dimension !== 'the_end' && Date.now() - startWarp < 15000 && !isCancelled()) {
      await sleep(250);
    }
    bot.clearControlStates();
  }
}

console.log(`Dimension after portal transit: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);

// 5. In The End, advance strictly WEST from spawn platform onto Main Island
if (bot.game.dimension === 'the_end') {
  bot.chat('delta: Inside The End! Advancing West onto Main Island to locate End Gateway!');
  
  // Look West and keep gaze tilted down to avoid Endermen aggro
  await bot.look(-Math.PI / 2, 0.35, true);

  if (bot.entity.position.x > 30.0) {
    console.log('Crossing West onto Main Island surface...');
    for (let targetX = 98; targetX >= 25 && !isCancelled(); targetX -= 4) {
      await bot.lookAt(new Vec3(targetX, Math.max(55, bot.entity.position.y), 0), true);
      bot.setControlState('forward', true);
      if (bot.entity.isCollidedHorizontally) {
        bot.setControlState('jump', true);
        await sleep(150);
        bot.setControlState('jump', false);
      }
      await sleep(300);
    }
    bot.clearControlStates();
  }

  // Scan for active End Gateway
  const gateways = bot.findBlocks({
    matching: b => b && b.name === 'end_gateway',
    maxDistance: 128,
    count: 10
  });

  console.log(`Found ${gateways.length} End Gateway portal blocks!`);
  for (const gp of gateways) {
    console.log(`- End Gateway at ${lib.fmt(gp)}, dist: ${bot.entity.position.distanceTo(gp).toFixed(1)}m`);
    bot.chat(`delta: Sighted End Gateway at ${lib.fmt(gp)}! Ready for Outer End warp!`);
  }
}

console.log('Delta Final Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension);
return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
