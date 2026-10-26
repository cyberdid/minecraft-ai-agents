// programs/591-fast-gearup-and-warp-nether.js
console.log('=== Step: Dig 2nd Log, Craft Stone Tools, Mine Cobble & Warp ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Dig 2nd log at (275, 75, -31) if needed
if (lib.count('*_log') < 2) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(275, 71, -31, 2));
    await lib.dig(275, 75, -31);
    await lib.pickup(4);
  } catch (e) {
    console.log('Log dig note:', e.message);
  }
}

console.log('Logs collected:', lib.count('*_log'));

// Convert to planks, sticks, wooden pickaxe
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const pName = logItem.name.replace('_log', '_planks');
  try {
    await lib.craft(pName, lib.count('*_log') * 4);
  } catch (e) {
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) await bot.craft(r, lib.count('*_log'), null);
  }
}

if (lib.count('stick') < 2) await lib.craft('stick', 4);
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 2. Walk to mine shaft at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// 3. Mine 3 stone for stone tools
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

// 4. Mine 20+ cobblestone
console.log('Mining 20+ cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 20 && digs < 28 && !isCancelled()) {
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
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 7. IMMEDIATELY step forward out of Nether portal frame
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));
  bot.chat(`beta: In Nether bunker (${lib.fmt(bot.entity.position)}) with ${lib.count('cobblestone')} cobble! Advancing along z<=-8 safe trail to Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
