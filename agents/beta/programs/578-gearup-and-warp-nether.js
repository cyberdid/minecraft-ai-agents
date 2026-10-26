// programs/578-gearup-and-warp-nether.js
console.log('=== Step: Fast Gear-Up & Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Gather 2 logs from nearby birch tree at (314, 71, -46)
console.log('Walking to birch tree at (314, 71, -46)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(314, 71, -46, 2));
} catch (e) {
  await lib.goTo(314, 71, -46, 2, { dig: false });
}

for (let y = 71; y <= 73; y++) {
  if (lib.count('*_log') >= 2) break;
  const b = bot.blockAt(new Vec3(314, y, -46));
  if (b && b.name.includes('log')) {
    try {
      await lib.dig(314, y, -46);
      await lib.pickup(3);
    } catch (e) {}
  }
}

console.log('Logs collected:', lib.count('*_log'));

// 2. Craft planks, sticks, wooden pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  await lib.craft(logName.replace('_log', '_planks'), lib.count(logName) * 4);
}
if (lib.count('stick') < 2) await lib.craft('stick', 4);
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Crafted wooden pickaxe! Inv:', JSON.stringify(lib.inv()));

// 3. Go to mine shaft at (301, 71, -44)
console.log('Going to mine shaft at (301, 71, -44)...');
await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));

// Mine 3 stone for stone tools
console.log('Mining 3 stone...');
for (let s = 0; s < 5; s++) {
  if (lib.count('cobblestone') >= 3) break;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(3);
    } catch (e) {}
  }
}

if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Crafted stone pickaxe & sword!');
}

// 4. Mine 24 cobblestone
console.log('Mining 24 cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 24 && digs < 32 && !isCancelled()) {
  digs++;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71 && (b.position.x >= 298 || b.position.z >= -48)
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

console.log('Final Cobblestone count:', lib.count('cobblestone'));
await lib.equipWeapon();

// 5. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
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

bot.chat(`beta: Re-armed with stone tools & ${lib.count('cobblestone')} cobble! In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Preparing Nether trail!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
