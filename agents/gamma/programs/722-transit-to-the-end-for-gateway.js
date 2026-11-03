// programs/722-transit-to-the-end-for-gateway.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 722: TRANSIT TO THE END FOR END GATEWAY EXPEDITION ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.chat('team: gamma marching to End Portal for Milestone 13 End Gateway & Elytra expedition!');

// Step 1: Exit Base House
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.z < -53.8) {
    try {
      console.log('Exiting Base House...');
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {}
  }

  // Step 2: March to Stronghold warp at (233, 70, -98)
  console.log('Marching to Stronghold warp at (233, 70, -98)...');
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

  // Check if warped to Stronghold (x > 2000)
  console.log('Pos after overland march:', lib.fmt(bot.entity.position));

  // If in Stronghold (x > 2000), step into End Portal at (2215.5, -9.0, 1466.5)
  if (bot.entity.position.x > 2000 && bot.game.dimension === 'overworld') {
    console.log('In Stronghold! Stepping into End Portal (2215, -9, 1466)...');
    const pBlock = new Vec3(2215.5, -9.0, 1466.5);
    await bot.lookAt(pBlock, true);
    bot.setControlState('forward', true);
    const startStep = Date.now();
    while (bot.game.dimension === 'overworld' && Date.now() - startStep < 10000 && !isCancelled()) {
      if (bot.entity.position.distanceTo(pBlock) > 0.4) {
        await bot.lookAt(pBlock, true);
        bot.setControlState('forward', true);
        if (bot.entity.isCollidedHorizontally || bot.entity.position.y < -8.5) {
          bot.setControlState('jump', true);
          await sleep(150);
          bot.setControlState('jump', false);
        }
      }
      await sleep(100);
    }
    bot.clearControlStates();
  }
}

console.log('Dimension after portal transit:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// If in The End, advance through tunnel to Main Island surface
if (bot.game.dimension === 'the_end') {
  bot.chat('gamma: Successfully in The End! Moving onto Main Island surface to scout End Gateway!');
  console.log('In The End! Pos:', lib.fmt(bot.entity.position));

  // If on spawn platform (x >= 98), walk West into tunnel
  if (bot.entity.position.x > 30.0) {
    console.log('Advancing West through tunnel to Main Island surface...');
    for (let targetX = 98; targetX >= 25 && !isCancelled(); targetX -= 4) {
      await bot.lookAt(new Vec3(targetX, bot.entity.position.y, 0), true);
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

  // Scan for End Gateway blocks
  const gateways = bot.findBlocks({
    matching: b => b && (b.name === 'end_gateway' || b.name === 'bedrock'),
    maxDistance: 96,
    count: 32
  });

  const trueGateways = gateways.filter(p => {
    const b = bot.blockAt(p);
    return b && b.name === 'end_gateway';
  });

  console.log(`Found ${trueGateways.length} active End Gateway portal blocks:`);
  for (const gp of trueGateways) {
    console.log(`End Gateway portal at ${lib.fmt(gp)}, dist=${bot.entity.position.distanceTo(gp).toFixed(1)}m`);
    bot.chat(`team: ACTIVE END GATEWAY FOUND AT ${lib.fmt(gp)}! Ready for Outer End warp!`);
  }

  // Equip netherite sword and shield
  try { await lib.equipArmor(); } catch (e) {}
  const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
  if (ns) await bot.equip(ns, 'hand');
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

console.log('=== END PROGRAM 722 ===');
return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
