// programs/600-sprint-base-gearup-and-frontline.js
console.log('=== Step: Sprint to Base, Gear Up & March to Frontline ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: SPRINT TO BASE ---
console.log('Sprint Waypoint 1: (240, 68, -55)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(240, 68, -55, 3));
} catch (e) {
  try { await lib.goToXZ(240, -55); } catch (e2) {}
}

console.log('Sprint Waypoint 2: Base Door at (294, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

// Enter Base and verify spawn
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Exit base to harvest trees
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// --- PART 2: DYNAMIC LOG HARVESTING ---
console.log('Walking towards trees at (320, 70, -52)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(320, 70, -52, 3));
} catch (e) {
  try { await lib.goToXZ(320, -52); } catch (e2) {}
}

console.log('Harvesting 4 logs dynamically...');
let minedLogs = 0;
while (lib.count('*_log') < 4 && minedLogs < 10 && !isCancelled()) {
  const logBlock = lib.find('*_log', { maxDistance: 16 }).find(b => b.position.y <= 73);
  if (!logBlock) break;
  try {
    await lib.dig(logBlock.position.x, logBlock.position.y, logBlock.position.z);
    minedLogs++;
    await lib.pickup(3);
  } catch (e) {
    break;
  }
}
await lib.pickup(4);
console.log('Total logs:', lib.count('*_log'));

// Convert to planks, sticks, wooden pickaxe
const logCount = lib.count('*_log');
if (logCount > 0) {
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  const pName = logItem ? logItem.name.replace('_log', '_planks') : 'oak_planks';
  try {
    await lib.craft(pName, logCount * 4);
  } catch (e) {
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) await bot.craft(r, logCount, null);
  }
}

if (lib.count('stick') < 4) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// --- PART 3: MINE STONE & COBBLESTONE ---
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// Mine 3 stone
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

// Mine 25 cobblestone
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

// --- PART 4: WARP TO NETHER ---
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  // --- PART 5: NETHER MARCH TO FRONTLINE ---
  console.log('Marching along proven Gamma East Ridge waypoints...');
  const waypoints = [
    { name: 'Ridge South', pos: new Vec3(62.5, 66, -30) },
    { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66, -55) },
    { name: 'Ridge Mid-North', pos: new Vec3(62.5, 67, -80) },
    { name: 'Ridge North Bend', pos: new Vec3(61.5, 66, -100) },
    { name: 'Fortress Approach', pos: new Vec3(50.0, 65, -115) },
    { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65, -127) },
    { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65, -145) },
    { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65, -160) },
    { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65, -169) }
  ];

  for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
    const wp = waypoints[i];
    console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name} at ${lib.fmt(wp.pos)}...`);
    try {
      await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 16000 });
    } catch (e) {
      try {
        await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 12000 });
      } catch (e2) {
        console.log(`Navigation note for ${wp.name}: ${e2.message}`);
      }
    }

    if (i >= 4) {
      try {
        await lib.pickup(6);
        await lib.equipArmor();
        await lib.equipWeapon();
      } catch (e) {}
    }
  }

  console.log('Frontline reached! Pos:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  bot.chat(`beta: United at Frontline Blast Wall (${lib.fmt(bot.entity.position)}) with ${lib.count('cobblestone')} cobble! Ready to breach Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
