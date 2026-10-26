// programs/601-craft-stone-tools-mine-cobble-warp-march.js
console.log('=== Step: Craft Stone Tools, Mine 25 Cobble, Warp & March to Frontline ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Craft oak planks
const logCount = lib.count('*_log');
if (logCount > 0) {
  try {
    await lib.craft('oak_planks', logCount * 4);
  } catch (e) {
    const r = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
    if (r) await bot.craft(r, logCount, null);
  }
}

if (lib.count('stick') < 4) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// 2. Craft stone_pickaxe directly (we have 3 cobblestone and 3 sticks!)
console.log('Crafting stone_pickaxe...');
if (lib.count('stone_pickaxe') < 1) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted successfully!');
  } catch (e) {
    console.log('Stone pickaxe craft note:', e.message);
    if (lib.count('wooden_pickaxe') < 1) {
      await lib.craft('wooden_pickaxe', 1);
    }
  }
}
console.log('Pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 3. Walk to mine shaft entrance at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// 4. Mine stone for sword & building blocks
console.log('Mining cobblestone in shaft...');
let digs = 0;
while (lib.count('cobblestone') < 26 && digs < 32 && !isCancelled()) {
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

// Craft stone_sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  try {
    await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
    console.log('Stone sword crafted and equipped!');
  } catch (e) {}
}

console.log('Cobblestone ready:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));

// 5. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 6. Wait for Nether warp
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

// 7. IMMEDIATELY step forward out of Nether portal frame into bunker
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  // 8. March along Gamma's tested waypoints to Frontline Blast Wall
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
  bot.chat(`beta: United at Frontline Blast Wall (${lib.fmt(bot.entity.position)}) with stone tools and ${lib.count('cobblestone')} cobble! Ready to breach Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
