// programs/595-sprint-base-spawn-and-gear.js
console.log('=== Step: Complete Sprint to Base, Set Spawn, Harvest & Gear Up ===');
console.log('Start Pos:', lib.fmt(bot.entity.position));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Sprint to Base via intermediate waypoint
console.log('Running to intermediate waypoint (250, 68, -70)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(250, 68, -70, 3));
} catch (e) {
  try { await lib.goToXZ(250, -70); } catch (e2) {}
}

console.log('Running to base door at (294, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

// 2. Enter Base
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door enter note:', e.message);
}

// 3. Set Spawn at base bed!
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SPAWN SUCCESSFULLY SET AT BASE BED!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const bed = bot.blockAt(new Vec3(294, 72, -55));
  if (bed) {
    try {
      await bot.activateBlock(bed);
      console.log('Bed manually activated at (294, 72, -55)');
    } catch (e2) {}
  }
}

// 4. Check furnaces
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)];
for (const fPos of furnaces) {
  const fBlock = bot.blockAt(fPos);
  if (fBlock && fBlock.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fBlock);
      if (f.outputItem()) {
        console.log(`Looted furnace ${fPos}: ${f.outputItem()?.name}x${f.outputItem()?.count}`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// 5. Exit base
console.log('Exiting base to harvest birch tree...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// 6. Harvest birch tree at (314, 72..75, -39)
console.log('Walking to birch tree at (314, 72, -39)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(314, 72, -39, 2));
} catch (e) {
  await lib.goTo(313, 72, -39, 2, { dig: false });
}

for (let y of [72, 73, 74, 75]) {
  const b = bot.blockAt(new Vec3(314, y, -39));
  if (b && b.name.includes('log')) {
    try {
      await lib.dig(314, y, -39);
    } catch (e) {}
  }
}
await lib.pickup(4);
console.log('Logs collected:', lib.count('*_log'));

// 7. Craft planks, sticks, wooden pickaxe
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

if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 8. Mine stone in shaft at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

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

// Craft stone tools
if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted!');
}

// 9. Mine 25+ cobblestone
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

// 10. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 11. Wait for Nether warp
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

// 12. IMMEDIATELY step forward out of Nether portal frame into bunker
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));
  bot.chat(`beta: Spawn set in base! In Nether bunker with ${lib.count('cobblestone')} cobble and stone tools!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
