// programs/605-complete-spawner-assault.js
console.log('=== Step: Craft Stone Gear, Mine Cobble, Warp & March to Frontline ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Craft birch planks & sticks
const logCount = lib.count('*_log');
if (logCount > 0) {
  try {
    await lib.craft('birch_planks', logCount * 4);
  } catch (e) {
    const r = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
    if (r) await bot.craft(r, logCount, null);
  }
}

if (lib.count('stick') < 4) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// 2. Craft wooden pickaxe (crafting table at 295, 72, -56 or lib ensures)
console.log('Crafting wooden pickaxe...');
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 3. Walk to mine shaft at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// 4. Mine 3 stone for stone pickaxe
console.log('Mining 3 stone for stone pickaxe...');
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
  console.log('Stone pickaxe crafted!');
}

// 5. Mine stone for stone_sword and 25+ cobblestone
console.log('Mining 25+ cobblestone with stone pickaxe...');
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

if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone sword crafted and equipped!');
}

console.log('Cobblestone ready:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));
await lib.equipWeapon();

// 6. Sprint into Nether portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 7. Wait for Nether warp
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

// 8. IMMEDIATELY step forward out of Nether portal frame into bunker
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  // 9. March through Gamma's tested waypoints to Frontline Blast Wall
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
    console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name}...`);
    try {
      await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 16000 });
    } catch (e) {
      try {
        await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 12000 });
      } catch (e2) {}
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
  await lib.pickup(6);
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // 10. Advance to z=-176 and x=38
  console.log('Advancing carefully to (44, 65, -176)...');
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -176));
  await lib.pickup(6);

  console.log('Stepping West along z=-176 to (38, 65, -176)...');
  for (let x = 43; x >= 38; x--) {
    await bot.pathfinder.goto(new goals.GoalBlock(x, 65, -176));
    await lib.pickup(4);
  }

  console.log('At x=38, z=-176! Inv:', JSON.stringify(lib.inv()));
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Step safely North onto (38, 65, -177)
  console.log('Stepping North onto (38, 65, -177)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(38, 65, -177));
  } catch (e) {}

  bot.chat(`beta: United at Frontline Spawner Walkway (${lib.fmt(bot.entity.position)}) with stone tools and ${lib.count('cobblestone')} cobble!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
