// programs/879-ascend-warp-and-enter-end.js
console.log('=== Program 879: Ascend Mine, Warp to Stronghold & Enter The End ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('alpha: Ascending to surface, hitting warp at (233, 70, -98), and entering The End with Netherite Sword!');

// Equip Netherite Sword
const sword = bot.inventory.items().find(i => i.name.includes('netherite_sword') || i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

if (bot.game.dimension === 'overworld') {
  // 1. Ascend to surface at (302, 71, -44) if deep underground
  if (bot.entity.position.y < 60) {
    console.log('Ascending from underground mine to surface (302, 71, -44)...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 3.0));
    } catch (e) {
      console.log('Pathfinder note, ascending with pillaring/steps:', e.message);
      // Fast vertical ascent to surface
      const cobble = bot.inventory.items().find(i => ['cobblestone', 'granite', 'diorite', 'andesite', 'dirt'].includes(i.name));
      if (cobble) await bot.equip(cobble, 'hand');
      
      const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      while (bot.entity.position.y < 68) {
        // Dig above
        const head = bot.blockAt(bot.entity.position.offset(0, 2, 0));
        if (head && head.boundingBox === 'block') {
          if (pick) await bot.equip(pick, 'hand');
          try { await bot.dig(head, true); } catch (de) {}
          if (cobble) await bot.equip(cobble, 'hand');
        }
        const below = bot.blockAt(bot.entity.position.offset(0, -0.2, 0));
        bot.setControlState('jump', true);
        await sleep(220);
        if (below && below.boundingBox === 'block') {
          try { await bot.placeBlock(below, new Vec3(0, 1, 0)); } catch (pe) {}
        }
        bot.setControlState('jump', false);
        await sleep(200);
      }
    }
  }

  console.log(`On surface: pos=${lib.fmt(bot.entity.position)}`);

  // 2. March to Stronghold warp trigger at (233, 70, -98)
  console.log('Marching to Stronghold warp trigger at (233, 70, -98)...');
  const warpTrigger = new Vec3(233.0, 70.0, -98.0);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(warpTrigger.x, warpTrigger.y, warpTrigger.z, 2.0));
  } catch (err) {
    try { await lib.goToXZ(warpTrigger.x, warpTrigger.z, { timeoutMs: 15000 }); } catch (e2) {}
  }

  // Wait for server warp to (2240, 35, 1456)
  console.log('Waiting for Stronghold warp...');
  const startWarp = Date.now();
  while (bot.entity.position.x < 1000 && Date.now() - startWarp < 10000) {
    await sleep(250);
  }
  console.log(`Position after warp trigger: ${lib.fmt(bot.entity.position)}`);

  // 3. At Stronghold (2240, 35, 1456), descend to active End Portal (2210, 0, 1470)
  if (bot.entity.position.x >= 2000) {
    console.log('At Stronghold! Descending to End Portal (2210, 0, 1470)...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(2210, 1, 1470, 2.5));
    } catch (pe) {}

    // Step into active end_portal
    const portals = bot.findBlocks({ matching: b => b && b.name === 'end_portal', maxDistance: 12, count: 9 });
    if (portals.length > 0) {
      console.log(`Stepping into active End Portal at ${lib.fmt(portals[0])}...`);
      await bot.lookAt(portals[0].offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      const warpEnd = Date.now();
      while (bot.game.dimension !== 'the_end' && Date.now() - warpEnd < 15000) {
        await sleep(250);
      }
      bot.clearControlStates();
    }
  }
}

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// 4. Inside the_end — strictly walk WEST onto Main Island
if (bot.game.dimension === 'the_end') {
  bot.chat('alpha: In The End! Heading strictly WEST to join team at central fountain (0, 65, 0)!');

  // Look West (-X) and pitch down to avoid Endermen gaze
  await bot.look(-Math.PI / 2, 0.35, true);

  // If on spawn platform (x >= 95), walk/bridge WEST onto mainland (x <= 95)
  if (bot.entity.position.x >= 95) {
    console.log('Crossing from spawn platform WEST onto mainland...');
    for (let step = 0; step < 14 && bot.entity.position.x > 85; step++) {
      const aheadPos = bot.entity.position.offset(-1, -1, 0);
      const aheadBlock = bot.blockAt(aheadPos);
      if (!aheadBlock || aheadBlock.boundingBox !== 'block') {
        const blockItem = bot.inventory.items().find(i => ['netherrack', 'end_stone', 'cobblestone', 'diorite', 'granite'].includes(i.name));
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
    await bot.pathfinder.goto(new goals.GoalNear(0.0, 65.0, 0.0, 10.0));
  } catch (fe) {}

  // Equip Netherite Sword
  const ns = bot.inventory.items().find(i => i.name.includes('netherite_sword') || i.name.includes('sword'));
  if (ns) await bot.equip(ns, 'hand');

  // Slay Dragon if perching
  const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
  if (dragon) {
    console.log(`Dragon at ${lib.fmt(dragon.position)}! Health: ${dragon.health}/200`);
    if (dragon.position.y <= 75 && bot.entity.position.distanceTo(dragon.position) <= 7.0) {
      console.log('DRAGON IN RANGE! STRIKING WITH NETHERITE SWORD!');
      await bot.lookAt(dragon.position.offset(0, 1.5, 0), true);
      bot.attack(dragon);
      bot.chat(`alpha: Slashed Ender Dragon with Netherite Sword! Health: ${dragon.health}/200!`);
    }
  }
}
