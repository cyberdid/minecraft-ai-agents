// programs/548-surface-portal-and-bunker-march.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 548: ASCEND MINE SHAFT & ENTER NETHER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Ascend mine staircase to surface (y >= 71)
if (bot.game.dimension === 'overworld') {
  console.log('Ascending mine staircase to surface portal at (299.5, 73.0, -53.5)...');
  
  // Use pathfinder up the staircase
  try {
    await lib.goTo(299, 72, -53, 1.5, { dig: false, timeoutMs: 18000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 1.2));
    } catch (e2) {
      console.log('Ascent note:', e2.message);
    }
  }

  console.log('At surface pos:', lib.fmt(bot.entity.position));

  // Enter Nether Portal
  console.log('Entering Nether Portal...');
  bot.chat('gamma: Ascended mine shaft to surface! Entering Nether portal to unite with team at Bunker!');
  await globalThis.enterNetherPortal(25000);
}

// Step 2: In Nether
if (bot.game.dimension !== 'the_nether') {
  console.log('Dimension guard: Still in Overworld.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('SUCCESS: In the_nether! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`gamma: In the_nether at ${lib.fmt(bot.entity.position)}! Marching safe East Ridge trail to Bunker (44, 65, -127)!`);

// Step 3: March safe waypoints WP 0 -> WP 11
globalThis.configureFireAvoidance();
const bunkerWps = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -70 },
  { x: 62, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }
];

let startIdx = 0;
let closestDist = Infinity;
for (let i = 0; i < bunkerWps.length; i++) {
  const d = bot.entity.position.distanceTo(new Vec3(bunkerWps[i].x, bunkerWps[i].y, bunkerWps[i].z));
  if (d < closestDist) {
    closestDist = d;
    startIdx = i;
  }
}
if (closestDist < 2.0 && startIdx < bunkerWps.length - 1) startIdx++;

console.log(`Marching from WP ${startIdx} to Bunker...`);
for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = bunkerWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();

  // If z <= -95, keep shield raised against Hoglins
  if (wp.z <= -95) {
    bot.activateItem(true);
  } else {
    bot.deactivateItem();
  }

  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 12000 });
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 6) break;
}

// Step 4: Step into Bunker at (44, 65, -128)
console.log('Stepping inside Fortress Workshop Bunker...');
try {
  await lib.goTo(44, 65, -128, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {}

console.log('Arrived inside bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`gamma: Inside Fortress Workshop Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. United with Alpha & Delta for Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
