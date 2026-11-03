// programs/738-warp-to-stronghold-and-enter-end.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 738: WARP TO STRONGHOLD & ENTER THE END WESTWARD ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Equip Netherite Sword & Shield
try {
  const ns = bot.inventory.items().find(i => i.name === 'netherite_sword' || i.name === 'iron_sword');
  if (ns) await bot.equip(ns, 'hand');
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
} catch (e) {}

// Step 1: In Overworld, march to warp trigger at (233, 70, -98)
if (bot.game.dimension === 'overworld') {
  console.log('Walking to Stronghold warp trigger at (233, 70, -98)...');
  const warpTrigger = new Vec3(233.0, 70.0, -98.0);
  
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(warpTrigger.x, warpTrigger.y, warpTrigger.z, 1.5));
  } catch (err) {
    try { await lib.goToXZ(warpTrigger.x, warpTrigger.z, { timeoutMs: 12000 }); } catch (e2) {}
  }

  // Wait for warp to (2240, 35, 1456)
  const startWarpWait = Date.now();
  while (bot.entity.position.x < 1000 && Date.now() - startWarpWait < 10000 && !isCancelled()) {
    await sleep(250);
  }

  console.log(`Pos after trigger: ${lib.fmt(bot.entity.position)}`);

  // Step 2: At Stronghold (2240, 35, 1456), descend to active End Portal (2210, 0, 1470)
  if (bot.entity.position.x >= 2000) {
    console.log('At Stronghold! Descending to End Portal (2210, 0, 1470)...');
    const portalCenter = new Vec3(2210.0, 1.0, 1470.0);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalCenter.x, portalCenter.y, portalCenter.z, 2.0));
    } catch (pe) {
      console.log('Pathfinder note:', pe.message);
    }

    // Step into active end_portal
    const portals = bot.findBlocks({ matching: b => b && b.name === 'end_portal', maxDistance: 12, count: 9 });
    if (portals.length > 0) {
      console.log(`Found active End Portal! Stepping in at ${lib.fmt(portals[0])}...`);
      await bot.lookAt(portals[0].offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      const warpEnd = Date.now();
      while (bot.game.dimension !== 'the_end' && Date.now() - warpEnd < 15000 && !isCancelled()) {
        await sleep(250);
      }
      bot.clearControlStates();
    }
  }
}

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 3: Inside the_end — strictly walk WEST toward (0, 65, 0)
if (bot.game.dimension === 'the_end') {
  bot.chat('delta: In The End! Heading strictly WEST to Main Island to join Beta & Gamma!');
  
  // Look West (-X) and keep gaze tilted slightly down to avoid Endermen gaze
  await bot.look(-Math.PI / 2, 0.35, true);

  // If on spawn platform (x >= 98), walk/bridge WEST into mainland (x <= 95)
  if (bot.entity.position.x >= 95) {
    console.log('Crossing from spawn platform WEST onto mainland...');
    for (let step = 0; step < 12 && bot.entity.position.x > 88 && !isCancelled(); step++) {
      // Check block directly ahead to the west
      const aheadPos = bot.entity.position.offset(-1, -1, 0);
      const aheadBlock = bot.blockAt(aheadPos);
      if (!aheadBlock || aheadBlock.boundingBox !== 'block') {
        // Place bridge block
        const blockItem = bot.inventory.items().find(i => ['netherrack', 'end_stone', 'cobblestone'].includes(i.name));
        if (blockItem) {
          await bot.equip(blockItem, 'hand');
          const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
          if (below) {
            try { await bot.placeBlock(below, new Vec3(-1, 0, 0)); } catch (be) {}
          }
        }
      }
      bot.setControlState('forward', true);
      await sleep(350);
      bot.setControlState('forward', false);
    }
  }

  // Advance toward central fountain (0, 65, 0)
  console.log('Advancing toward central bedrock fountain (0, 65, 0)...');
  const movesEnd = new Movements(bot, mcData);
  movesEnd.canDig = false;
  movesEnd.allowParkour = true;
  bot.pathfinder.setMovements(movesEnd);
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(0.0, 65.0, 0.0, 8.0));
  } catch (fe) {}

  // Slay Dragon if perching
  const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
  if (dragon) {
    console.log(`Dragon at ${lib.fmt(dragon.position)}! HP: ${dragon.health}/200`);
    if (dragon.position.y <= 75 && bot.entity.position.distanceTo(dragon.position) <= 6.0) {
      console.log('DRAGON IN RANGE! STRIKING WITH NETHERITE SWORD!');
      await bot.lookAt(dragon.position.offset(0, 1.5, 0), true);
      bot.attack(dragon);
      bot.chat(`delta: Slashed Ender Dragon with Netherite Sword! HP: ${dragon.health}/200!`);
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
