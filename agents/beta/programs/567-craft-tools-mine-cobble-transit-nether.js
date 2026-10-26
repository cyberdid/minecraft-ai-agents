// programs/567-craft-tools-mine-cobble-transit-nether.js
console.log('=== Step: Craft Tools, Mine 32+ Cobblestone, and Transit Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Craft wooden pickaxe from planks/logs
if (lib.count('*_planks') < 4 && lib.count('*_log') > 0) {
  const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (logName) {
    await lib.craft(logName.replace('_log', '_planks'), 4);
  }
}
if (lib.count('stick') < 2) {
  await lib.craft('stick', 4);
}
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Crafted wooden pickaxe! Inv:', JSON.stringify(lib.inv()));

// 2. Walk to mine shaft at (302, 71, -44)
console.log('Walking to mine shaft at (302, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 2));
} catch (e) {
  console.log('Path to mine shaft note:', e.message);
  await lib.goTo(302, 71, -44, 2, { dig: false });
}

// 3. Mine 3 stone to craft stone tools
console.log('Mining 3 stone for stone pickaxe...');
for (let s = 0; s < 3; s++) {
  const st = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y < 71 && (b.position.x > 297 || b.position.z > -50)
  });
  if (st) {
    await lib.dig(st.position.x, st.position.y, st.position.z);
    await lib.pickup(3);
  }
}

console.log('Cobblestone after 3 stone:', lib.count('cobblestone'));
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);
console.log('Crafted stone pickaxe & stone sword! Inv:', JSON.stringify(lib.inv()));

// 4. Mine 32+ cobblestone
console.log('Mining 32+ cobblestone...');
let attempts = 0;
while (lib.count('cobblestone') < 32 && attempts < 40 && !isCancelled()) {
  attempts++;
  const st = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y < 71 && (b.position.x > 297 || b.position.z > -50)
  });
  if (st) {
    try {
      await lib.dig(st.position.x, st.position.y, st.position.z);
      await lib.pickup(3);
    } catch (e) {
      break;
    }
  } else {
    // Step 1 block deeper
    try {
      await bot.pathfinder.goto(new goals.GoalNear(bot.entity.position.x, bot.entity.position.y - 1, bot.entity.position.z + 1, 1));
    } catch (e2) {
      break;
    }
  }
}

console.log('Mined cobblestone:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));
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

// 6. Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

bot.chat(`beta: Re-armed with stone sword & ${lib.count('cobblestone')} cobble! In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Sprinting to spawner front!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
