// programs/541-return-to-base-portal-and-bunker.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 541: RETURN TO BASE PORTAL & MARCH TO BUNKER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Dimension Guard: Must be in Overworld to start
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld. Walking East across plains to Nether Portal at (299.5, 73.0, -53.5)...');
  bot.chat('gamma: Sprinting to Nether portal at (299.5, 73, -54) to unite with Alpha & Beta at bunker!');

  // Fast path to portal
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 30000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 2.0));
    } catch (e2) {}
  }

  console.log('Near portal sill. Pos:', lib.fmt(bot.entity.position));

  // Enter portal
  const portalRes = await globalThis.enterNetherPortal(25000);
  console.log('Portal transit result:', JSON.stringify(portalRes));
}

// Verify we are now in Nether
if (bot.game.dimension !== 'the_nether') {
  console.log('Dimension guard: Still in Overworld! Stopping.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('SUCCESS: In the_nether! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`gamma: In the_nether at ${lib.fmt(bot.entity.position)}! Marching to Fortress Bunker (44, 65, -127) to unite with Alpha & Beta!`);

// March safe waypoints from Portal Camp to Bunker (WP 0 -> WP 11)
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

console.log(`Marching to Bunker starting from WP ${startIdx}...`);
for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = bunkerWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z)); // Low gaze

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

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march.`);
    break;
  }
}

console.log('Arrived at Bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Check teammates at Bunker
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates united at Bunker (${teammates.length}):`);
for (const t of teammates) {
  const d = bot.entity.position.distanceTo(t.position).toFixed(1);
  console.log(`  ${t.username} at ${lib.fmt(t.position)} (${d}m), held: ${t.heldItem?.name}`);
}

bot.chat(`gamma: United with team at Fortress Bunker (${lib.fmt(bot.entity.position)})! Ready to execute Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  teammatesCount: teammates.length,
  inv: lib.inv()
};
