// programs/636-advance-to-pillbox-and-farm.js
console.log('=== Program 636: Advance to Spawner Pillbox & Farm Blaze Rods ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Step 1: Exit base if in overworld
if (bot.game.dimension === 'overworld') {
  // Ensure door is open
  const door = bot.findBlock({ matching: b => b && b.name.includes('door'), maxDistance: 6 });
  if (door) {
    console.log('Found door at', lib.fmt(door.position));
    try {
      await lib.door(door.position.x, door.position.y, door.position.z, true);
    } catch (e) {}
  }

  // Walk directly to portal approach at (299, 72, -53)
  console.log('Walking to portal approach (299, 72, -53)...');
  try {
    await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Walk to portal note:', e.message);
  }

  // Warp through Nether Portal
  console.log('Entering Nether Portal...');
  const warpRes = await enterNetherPortal();
  console.log('Portal warp result:', warpRes);
}

// Step 2: In Nether, march to Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Marching along covered waypoints to Spawner Pillbox (36, 66, -187)!');
  console.log('Marching to Spawner Pillbox...');
  const marchRes = await marchToSpawnerPillbox();
  console.log('March result:', marchRes);

  // Step 3: Farm Blazes at Pillbox
  if (bot.entity.position.distanceTo(new Vec3(36, 66, -187)) < 10) {
    bot.chat(`alpha: Locked at Spawner Pillbox! Slaying Blazes for Milestone 8! Current rods: ${lib.count('blaze_rod')}/8`);
    console.log('Farming Blazes at Pillbox...');
    const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
    console.log('Farm result:', farmRes);

    const totalRods = lib.count('blaze_rod');
    if (totalRods >= 8) {
      bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${totalRods} Blaze Rods! Retreating to Overworld base...`);
      console.log('Milestone 8 complete! Retreating to base...');
      await retreatToOverworldBase();
    }
  } else {
    console.log('Warning: Did not reach Pillbox within 10m. Pos:', lib.fmt(bot.entity.position));
    bot.chat(`alpha: March halted at ${lib.fmt(bot.entity.position)}. Holding position in cover.`);
  }
}

console.log('=== Program 636 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
