// programs/557-regear-and-mine-nether-gold.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: REGEAR & MINE NETHER GOLD FOR BOOTS ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Ensure 16 cobblestone
if (lib.count('cobblestone') < 16) {
  try {
    await lib.collect('cobblestone', 16 - lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobble collect notice:', e.message);
  }
}

// Step 2: Enter Nether Portal
console.log('Warping into Nether Portal at (299.5, 73, -54)...');
await enterNetherPortal();
console.log(`Dimension after portal: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 3: In Nether, advance along safe covered waypoints to Fortress Workshop Bunker
if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();
  
  // Step out of portal frame
  if (bot.entity.position.distanceTo(new Vec3(46.5, 66.0, 2.0)) < 4.0) {
    await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
    bot.setControlState('forward', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    await clearFireAhead();
  }

  const waypoints = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61.5, y: 67, z: -55 },
    { x: 61.5, y: 67, z: -60 },
    { x: 61.5, y: 67, z: -65 },
    { x: 61.5, y: 67, z: -70 },
    { x: 61.5, y: 67, z: -75 },
    { x: 62.0, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 } // Bunker doorway
  ];

  let startIdx = 0;
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching along ridge from WP ${startIdx}/${waypoints.length}...`);
  for (let i = startIdx; i < waypoints.length && !isCancelled(); i++) {
    await clearFireAhead();
    const wp = waypoints[i];
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }
    try { await lib.pickup(3.0); } catch (e) {}

    // Check for nearby Nether Gold Ore along ridge
    const goldNear = bot.findBlocks({
      matching: b => b && b.name === 'nether_gold_ore',
      maxDistance: 4,
      count: 4
    });
    for (const gp of goldNear) {
      if (lib.count('gold_ingot') >= 4 || lib.count('golden_boots') > 0) break;
      const gb = bot.blockAt(gp);
      if (gb && gp.y >= 64) {
        console.log(`Mining nether_gold_ore at ${lib.fmt(gp)}...`);
        try {
          await lib.equipTool('iron_pickaxe');
          await bot.dig(gb);
          await sleep(300);
          await lib.pickup(3.0);
        } catch (err) {}
      }
    }

    if (bot.health <= 7) break;
  }

  // Inside bunker at (44, 65, -127) - step inside 2-high doorway to (44, 65, -132)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
  } catch (e) {}

  // Mine gold veins inside bunker room / staircase
  const bunkerGold = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 6,
    count: 8
  });
  for (const gp of bunkerGold) {
    if (lib.count('gold_ingot') >= 4 || lib.count('golden_boots') > 0) break;
    const gb = bot.blockAt(gp);
    if (gb) {
      console.log(`Mining bunker gold ore at ${lib.fmt(gp)}...`);
      try {
        await lib.equipTool('iron_pickaxe');
        await bot.dig(gb);
        await sleep(300);
        await lib.pickup(3.0);
      } catch (err) {}
    }
  }

  // Craft gold ingots from nuggets
  console.log(`Gold nuggets: ${lib.count('gold_nugget')}, Gold ingots: ${lib.count('gold_ingot')}`);
  if (lib.count('gold_nugget') >= 9) {
    try {
      console.log('Crafting gold ingots...');
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log(`Gold ingots now: ${lib.count('gold_ingot')}`);
    } catch (e) {
      console.log('Gold ingot craft notice:', e.message);
    }
  }

  // Craft golden_boots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      console.log('Crafting golden_boots for 100% Piglin neutrality!');
      await lib.craft('golden_boots', 1);
      console.log('Crafted golden_boots!');
    } catch (e) {
      console.log('Golden boots craft notice:', e.message);
    }
  }

  // Equip golden_boots if crafted
  try {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'torso'); // or equipArmor
      await lib.equipArmor();
      console.log('GOLDEN BOOTS EQUIPPED! 100% Piglin neutrality ACTIVE!');
      bot.chat('delta: Golden boots equipped! 100% Piglin neutrality active! Ready to barter for Ender Pearls!');
    }
  } catch (e) {}

  bot.chat(`delta: Stationed at Fortress Bunker (44, 65, -132). HP: ${bot.health.toFixed(1)}, Gold Ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}/12.`);
}

console.log('=== PROGRAM 557 COMPLETE ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
