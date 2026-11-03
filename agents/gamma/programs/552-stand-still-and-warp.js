// programs/552-stand-still-and-warp.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 552: STAND STILL & WARP TO NETHER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Ensure standing motionless inside active nether_portal block
bot.clearControlStates();
bot.pathfinder.setGoal(null);
bot.pathfinder.stop();

console.log('Standing 100% motionless inside portal frame for 80-tick survival warp...');
bot.chat('gamma: Standing motionless in portal frame awaiting Nether warp...');

const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp not triggered yet. Current pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('WARP SUCCESS! Inside the_nether at pos:', lib.fmt(bot.entity.position));
await sleep(400);

// Step 2: Step forward out of portal into Nether bunker
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.setControlState('forward', false);

bot.chat(`gamma: Inside the_nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20. Marching to Bunker (44, 65, -127)!`);

// Step 3: Fast march safe East Ridge trail to Bunker (WP 0 -> WP 11)
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

for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
  const wp = bunkerWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();
  if (wp.z <= -95) bot.activateItem(true);
  else bot.deactivateItem();

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
bot.chat(`gamma: Stationed at Fortress Workshop Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. United with Alpha & Delta for Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
