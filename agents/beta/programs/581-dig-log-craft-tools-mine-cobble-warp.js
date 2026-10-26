// programs/581-dig-log-craft-tools-mine-cobble-warp.js
console.log('=== Step: Dig 1 Log, Craft Pickaxe, Mine Cobble, and Warp ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Dig 1 more log
const logBlock = bot.findBlock({ matching: mcData.blocksByName.birch_log.id, maxDistance: 4 });
if (logBlock) {
  try {
    await lib.dig(logBlock.position.x, logBlock.position.y, logBlock.position.z);
    await lib.pickup(3);
  } catch (e) {
    console.log('Log dig note:', e.message);
  }
}

// Convert any log to planks with bot.craft
for (let c = 0; c < 2; c++) {
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (logItem) {
    const r = bot.recipesFor(mcData.itemsByName[logItem.name.replace('_log', '_planks')].id, null, 1, null)[0];
    if (r) await bot.craft(r, 1, null);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));

// 2. Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Crafted wooden pickaxe! Inv:', JSON.stringify(lib.inv()));

// 3. Walk to mine shaft at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// 4. Mine 3 stone for stone tools
console.log('Mining 3 stone for stone tools...');
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
  console.log('Stone tools crafted!');
}

// 5. Mine 24 cobblestone
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

// 6. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 7. Wait for Nether warp
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
