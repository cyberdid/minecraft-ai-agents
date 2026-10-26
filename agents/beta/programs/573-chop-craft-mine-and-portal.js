// programs/573-chop-craft-mine-and-portal.js
console.log('=== Step: Fast Chop, Craft Stone Tools, Mine Cobble & Transit Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Chop 2 more logs
console.log('Collecting logs...');
try {
  await lib.collect('*_log', 2);
} catch (e) {
  console.log('Log collect note:', e.message);
}

console.log('Logs in inv:', lib.count('*_log'));

// 2. Craft planks, sticks, wooden pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName && lib.count('*_planks') < 4) {
  await lib.craft(logName.replace('_log', '_planks'), lib.count(logName) * 4);
}
if (lib.count('stick') < 2) await lib.craft('stick', 4);
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}

console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 3. Find and mine 3 stone for stone tools
console.log('Mining 3 stone for stone pickaxe & sword...');
for (let s = 0; s < 6; s++) {
  if (lib.count('cobblestone') >= 3) break;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 6
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(4);
    } catch (e) {}
  }
}

console.log('Cobblestone count:', lib.count('cobblestone'));
if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted! Inv:', JSON.stringify(lib.inv()));
}

// 4. Mine 20+ cobblestone with stone pickaxe
console.log('Mining 20+ cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 20 && digs < 30 && !isCancelled()) {
  digs++;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(3);
    } catch (e) {
      break;
    }
  } else {
    break;
  }
}

console.log('Cobblestone mined:', lib.count('cobblestone'));
await lib.equipWeapon();

// 5. Sprint to Nether Portal at (298.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting to Nether portal...');
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

// 6. Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

bot.chat(`beta: In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}! Cobblestone: ${lib.count('cobblestone')}, Gear: stone sword & pickaxe. Sprinting to Spawner front!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
