// programs/596-harvest-mine-and-warp.js
console.log('=== Step: Harvest Oak Tree, Mine Cobblestone & Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Walk to oak tree at (322, 70, -55)
console.log('Walking to oak tree at (322, 70, -55)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(322, 70, -55, 2));
} catch (e) {
  await lib.goTo(321, 70, -55, 2, { dig: false });
}

// 2. Dig 4 oak logs
for (let y of [70, 71, 69, 68]) {
  const b = bot.blockAt(new Vec3(322, y, -55));
  if (b && b.name.includes('log')) {
    console.log(`Digging oak log at (322, ${y}, -55)...`);
    try {
      await lib.dig(322, y, -55);
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }
}
await lib.pickup(4);
console.log('Logs collected:', lib.count('*_log'));

// 3. Craft planks, sticks, wooden pickaxe
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

if (lib.count('stick') < 4) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Ensure wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 4. Walk to mine shaft entrance at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// 5. Mine 3 stone for stone tools
console.log('Mining 3 stone for stone tools...');
for (let s = 0; s < 6; s++) {
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

// Craft stone tools
if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted!');
}

// 6. Mine 25+ cobblestone
console.log('Mining 25+ cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 25 && digs < 32 && !isCancelled()) {
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

console.log('Cobblestone ready:', lib.count('cobblestone'));
await lib.equipWeapon();

// 7. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 8. Wait for Nether warp
const startDim = bot.game.dimension;
console.log('Waiting in portal for dimension change...');
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 9. IMMEDIATELY step forward out of Nether portal frame into bunker
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));
  bot.chat(`beta: In Nether bunker with ${lib.count('cobblestone')} cobble and stone tools! Advancing to Spawner front!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
