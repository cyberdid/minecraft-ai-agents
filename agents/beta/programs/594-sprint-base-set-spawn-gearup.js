// programs/594-sprint-base-set-spawn-gearup.js
console.log('=== Step: Sprint to Base, Set Spawn, Gear Up & Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Sprint to Base Door at (294, 72, -54)
console.log('Sprinting to base door at (294, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
} catch (e) {
  await lib.goTo(294, 72, -54, 2, { dig: false });
}

// 2. Enter Base through door
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
  // Fallback: manually activate bed at (294, 72, -55)
  const bed = bot.blockAt(new Vec3(294, 72, -55));
  if (bed) {
    try {
      await bot.activateBlock(bed);
      console.log('Bed manually activated at (294, 72, -55)');
    } catch (e2) {}
  }
}

// 4. Check all 3 furnaces for iron/food
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)];
for (const fPos of furnaces) {
  const fBlock = bot.blockAt(fPos);
  if (fBlock && fBlock.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fBlock);
      console.log(`Furnace ${fPos}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) await f.takeOutput();
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

// Check if we can craft a shield (needs 1 iron_ingot + 6 planks)
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6 && lib.count('shield') < 1) {
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('SHIELD CRAFTED AND EQUIPPED!');
  } catch (e) {
    console.log('Shield craft note:', e.message);
  }
}

// 9. Mine 30+ cobblestone
console.log('Mining 30+ cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 30 && digs < 38 && !isCancelled()) {
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
