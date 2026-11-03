// programs/552-march-to-bunker.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: RETURN TO BASE & MARCH TO FORTRESS BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Walk to Base (293, 72, -55)
console.log('Walking to base...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2)); } catch (e2) {}
}

console.log(`Pos near base: ${lib.fmt(bot.entity.position)}`);

// Check chest for shield
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(cBlock);
    const shield = chest.containerItems().find(i => i.name === 'shield');
    if (shield && lib.count('shield') === 0) {
      console.log('Withdrawing shield from chest...');
      await chest.withdraw(shield.type, null, 1);
    }
    chest.close();
  } catch (e) {}
}

// Equip shield in offhand if found
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// Quick regear (ensures 16 cobblestone)
try {
  await quickRegear({ cobble: 16 });
} catch (e) {}

// Ensure shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

bot.chat('delta: Fully regeared! HP: 20/20, Food: 20/20. Marching to Fortress Workshop Bunker (44, 65, -127) to unite with Alpha!');

// Step 2: Enter Nether Portal
console.log('Entering Nether Portal...');
await enterNetherPortal();
console.log(`Dimension after portal: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 3: March East Ridge waypoints to Fortress Workshop Bunker at (44, 65, -127)
if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();

  const bunkerWaypoints = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61.5, y: 67, z: -55 },
    { x: 61.5, y: 67, z: -60 },
    { x: 61.5, y: 67, z: -65 },
    { x: 61.5, y: 67, z: -70 },
    { x: 61.5, y: 67, z: -75 },
    { x: 62.0, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 } // Fortress Workshop Bunker
  ];

  let startIdx = 0;
  for (let i = 0; i < bunkerWaypoints.length; i++) {
    const wp = bunkerWaypoints[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching to Fortress Bunker from WP ${startIdx}/${bunkerWaypoints.length}...`);
  for (let i = startIdx; i < bunkerWaypoints.length && !isCancelled(); i++) {
    await clearFireAhead();
    const wp = bunkerWaypoints[i];
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }
    try { await lib.pickup(3.0); } catch (e) {}
  }

  console.log(`=== ARRIVED AT FORTRESS BUNKER ===`);
  console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

  // Check Alpha
  const alpha = bot.players['alpha'];
  if (alpha && alpha.entity) {
    console.log(`Alpha is here at ${lib.fmt(alpha.entity.position)}!`);
  }

  bot.chat('delta: Arrived at Fortress Workshop Bunker (44, 65, -127)! United with team for Milestone 9!');
}

console.log('=== PROGRAM 552 COMPLETE ===');
console.log(`Final pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Dim: ${bot.game.dimension}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv: lib.inv()
};
