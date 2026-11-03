// programs/615-standby-at-portal-frame.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 615: STANDBY AT PORTAL SILL FOR BETA LAVA & WARP ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// Step 1: Step to portal approach
try {
  await lib.goTo(297.5, 72.0, -53.0, 0.8, { timeoutMs: 5000 });
} catch (e) {}

await bot.lookAt(new Vec3(299.5, 73.0, -53.5), true);

// Step 2: Loop until portal lights (up to 70 seconds)
const start = Date.now();
let isLit = false;

while (Date.now() - start < 70000 && !isCancelled()) {
  const p1 = bot.blockAt(new Vec3(299, 73, -54));
  const p2 = bot.blockAt(new Vec3(300, 73, -54));

  if (p1?.name === 'nether_portal' || p2?.name === 'nether_portal') {
    isLit = true;
    console.log('NETHER PORTAL IS ACTIVELY LIT!');
    break;
  }

  const sill = bot.blockAt(new Vec3(299, 72, -54));
  if (sill?.name === 'obsidian') {
    console.log('Obsidian sill in place! Awaiting flint & steel ignition...');
  } else if (sill?.name === 'lava') {
    console.log('Lava in basin! Quench with water now!');
  }

  const beta = bot.players.beta?.entity;
  if (beta && beta.position.y >= 70) {
    console.log(`Beta is on surface at ${lib.fmt(beta.position)}, held: ${beta.heldItem?.name}`);
  }

  await sleep(1500);
}

if (!isLit) {
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const p1 = bot.blockAt(new Vec3(299, 73, -54));
  console.log('Current state — Sill:', sill?.name, 'Portal:', p1?.name);
  for (const [name, p] of Object.entries(bot.players)) {
    if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
  return { sill: sill?.name, portal: p1?.name, dim: bot.game.dimension };
}

// Step 3: Portal is lit! Step into portal frame
bot.chat('gamma: Nether portal is LIT! Stepping onto sill (299.5, 73.0, -53.5) for survival warp into the_nether!');
await bot.lookAt(new Vec3(299.5, 73.0, -53.5), true);
try {
  await lib.goTo(299.5, 73.0, -53.5, 0.5, { timeoutMs: 5000 });
} catch (e) {
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

bot.pathfinder.stop();
bot.clearControlStates();

console.log('Standing motionless inside nether_portal block for 80 ticks...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp not triggered within timeout. Dimension:', bot.game.dimension);
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('WARP SUCCESSFUL! Arrived in the_nether at:', lib.fmt(bot.entity.position));
await sleep(400);

// Step 4: Step forward into Nether portal bunker
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

bot.chat(`gamma: In the_nether at ${lib.fmt(bot.entity.position)}! Marching safe East Ridge trail to Fortress Workshop Bunker (44, 65, -127)!`);

// Step 5: March safe East Ridge waypoints to Bunker
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

// Step 6: Inside bunker at (44, 65, -128)
try {
  await lib.goTo(44, 65, -128, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {}

console.log('Arrived inside bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`gamma: Stationed at Fortress Workshop Bunker (${lib.fmt(bot.entity.position)})! Ready to mine gold vein & barter for Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
