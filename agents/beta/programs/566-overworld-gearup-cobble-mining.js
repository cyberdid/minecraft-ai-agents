// programs/566-overworld-gearup-cobble-mining.js
console.log('=== Step: Overworld Gear-Up & Mine 40+ Cobblestone ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Step out of base door
console.log('Stepping through base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door error:', e.message);
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalNear(296, 72, -54, 1));
}

console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Gather wood (chop 4-6 logs)
console.log('Gathering logs...');
for (let i = 0; i < 4; i++) {
  if (lib.count('*_log') >= 4) break;
  const log = lib.find('*_log', { maxDistance: 16 })[0];
  if (log && log.position.y <= 74) {
    try {
      await lib.goTo(log.position.x, log.position.y, log.position.z, 2, { dig: false });
      await lib.dig(log.position.x, log.position.y, log.position.z);
      await lib.pickup(4);
    } catch (e) {
      console.log('Log dig error:', e.message);
      break;
    }
  } else {
    break;
  }
}

console.log('Logs count:', lib.count('*_log'));

// Craft planks, sticks, wooden pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  await lib.craft(logName.replace('_log', '_planks'), lib.count(logName) * 4);
}
const plankName = Object.keys(lib.inv()).find(k => k.endsWith('_planks')) || 'oak_planks';
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Crafted wooden pickaxe! Inv:', JSON.stringify(lib.inv()));

// 3. Go to mine shaft entrance at (302, 71, -44)
console.log('Going to mine shaft at (302, 71, -44)...');
await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 1));

// Mine 3 stone for stone pickaxe
console.log('Mining 3 stone for stone pickaxe...');
for (let s = 0; s < 3; s++) {
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.deepslate?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y < 71 // mine downward / into floor or wall
  });
  if (stone) {
    await lib.dig(stone.position.x, stone.position.y, stone.position.z);
    await lib.pickup(3);
  }
}

console.log('Cobblestone after 3 stone:', lib.count('cobblestone'));
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);
console.log('Crafted stone pickaxe & stone sword! Inv:', JSON.stringify(lib.inv()));

// 4. Mine 32+ cobblestone with stone pickaxe
console.log('Mining 32+ cobblestone with stone pickaxe...');
while (lib.count('cobblestone') < 32 && !isCancelled()) {
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y < 71 && (b.position.x > 297 || b.position.z > -50) // stay in mine shaft, away from base walls
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(3);
    } catch (e) {
      break;
    }
  } else {
    // Step deeper into shaft
    await bot.pathfinder.goto(new goals.GoalNear(bot.entity.position.x + 1, bot.entity.position.y - 1, bot.entity.position.z, 1));
  }
}

console.log('Final Cobblestone count:', lib.count('cobblestone'));
await lib.craft('stone_sword', 1); // spare for teammate
await lib.equipWeapon();

// 5. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting to Nether portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  try {
    await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
  } catch (e2) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.clearControlStates();
  }
}

// Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

bot.chat(`beta: Re-armed with stone tools & ${lib.count('cobblestone')} cobblestone! In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Sprinting to build spawner bunker!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
