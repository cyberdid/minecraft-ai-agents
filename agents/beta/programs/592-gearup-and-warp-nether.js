// programs/592-gearup-and-warp-nether.js
console.log('=== Step: Harvest Tree, Mine Cobblestone, Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Exit base if inside
if (bot.entity.position.x < 298 && bot.entity.position.z < -50) {
  try {
    console.log('Exiting base through door at (294, 72, -54)...');
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door exit note:', e.message);
  }
}

// 2. Walk to tree at (314, 72, -39) and harvest 3 logs
console.log('Walking to birch tree at (314, 72, -39)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(314, 72, -39, 2));
} catch (e) {
  await lib.goTo(313, 72, -39, 2, { dig: false });
}

for (let y of [72, 73, 74]) {
  const b = bot.blockAt(new Vec3(314, y, -39));
  if (b && b.name.includes('log')) {
    console.log(`Digging log at (314, ${y}, -39)...`);
    try {
      await lib.dig(314, y, -39);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}
await lib.pickup(4);
console.log('Logs in inventory:', lib.count('*_log'));

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

if (lib.count('stick') < 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// Head to crafting table at (295, 72, -56) or ensure table
console.log('Crafting wooden pickaxe...');
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

if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted!');
}

// 6. Mine 24+ cobblestone
console.log('Mining 24+ cobblestone...');
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
  bot.chat(`beta: In Nether bunker (${lib.fmt(bot.entity.position)}) with ${lib.count('cobblestone')} cobble! Advancing along z<=-8 safe trail to Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
