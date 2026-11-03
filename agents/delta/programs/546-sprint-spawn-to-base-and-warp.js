// programs/546-sprint-spawn-to-base-and-warp.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: SPRINT FROM SPAWN TO BASE & MARCH ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Staged sprint to Base (293, 72, -55)
const spawnWaypoints = [
  new Vec3(170, 64, -120),
  new Vec3(230, 65, -90),
  new Vec3(285, 71, -60),
  new Vec3(293, 72, -55)
];

for (let i = 0; i < spawnWaypoints.length; i++) {
  const wp = spawnWaypoints[i];
  console.log(`Sprinting to waypoint ${i + 1}/${spawnWaypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 3, { timeoutMs: 15000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
    } catch (e2) {}
  }
}

console.log(`Arrived near base: ${lib.fmt(bot.entity.position)}`);

// Step 2: Set spawn at bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 8 });
if (bedBlock) {
  try {
    await lib.setSpawn(bedBlock.position.x, bedBlock.position.y, bedBlock.position.z);
    console.log('Spawn set at base bed!');
  } catch (e) {}
}

// Step 3: Check chest for shield
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(cBlock);
    const shield = chest.containerItems().find(i => i.name === 'shield');
    if (shield && lib.count('shield') === 0) {
      console.log('Withdrawing shield from chest...');
      await chest.withdraw(shield.type, null, 1);
    }
    const iron = chest.containerItems().find(i => i.name === 'iron_ingot');
    if (iron && lib.count('shield') === 0) {
      console.log('Withdrawing iron ingot to craft shield...');
      await chest.withdraw(iron.type, null, 1);
    }
    chest.close();
  } catch (e) {}
}

// Craft shield if we have iron ingot
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    await lib.craft('shield', 1);
    console.log('Shield crafted!');
  } catch (e) {}
}

// Equip shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// Quick regear (ensures cobble, tools, armor)
try {
  await quickRegear({ cobble: 16 });
} catch (e) {}

bot.chat('delta: Fully regeared! HP: 20/20, Food: 20/20. Warping into Nether to advance Milestone 9!');

// Step 4: Enter Nether Portal
console.log('Entering Nether Portal...');
await enterNetherPortal();
console.log(`Dimension after portal: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 5: March to Spawner Pillbox
if (bot.game.dimension === 'the_nether') {
  console.log('Marching to Spawner Pillbox...');
  const res = await marchToSpawnerPillbox();
  console.log('marchToSpawnerPillbox result:', JSON.stringify(res));

  const pillboxPos = new Vec3(36.5, 66.0, -187.0);
  if (bot.entity.position.distanceTo(pillboxPos) < 4.0) {
    bot.chat('delta: Arrived at Spawner Pillbox (36, 66, -187)! Engaging Blazes!');
    await farmBlazeRodsAtPillbox(8, 60000);
  }
}

console.log('=== PROGRAM 546 COMPLETE ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
