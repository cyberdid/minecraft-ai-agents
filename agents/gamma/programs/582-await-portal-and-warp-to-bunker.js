// programs/582-await-portal-and-warp-to-bunker.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 582: AWAIT PORTAL REIGNITION & WARP TO FORTRESS BUNKER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Wait for portal to ignite (up to 45 seconds)
let portalBlock = bot.blockAt(new Vec3(299, 73, -54)) || bot.blockAt(new Vec3(300, 73, -54));
const waitStart = Date.now();
while ((!portalBlock || portalBlock.name !== 'nether_portal') && Date.now() - waitStart < 45000 && !isCancelled()) {
  portalBlock = bot.blockAt(new Vec3(299, 73, -54)) || bot.blockAt(new Vec3(300, 73, -54));
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  if (sill && sill.name === 'obsidian' && (!portalBlock || portalBlock.name !== 'nether_portal')) {
    console.log('Obsidian sill is in place! Awaiting flint & steel ignition...');
  }
  await sleep(1500);
}

// Check if lit
portalBlock = bot.blockAt(new Vec3(299, 73, -54)) || bot.blockAt(new Vec3(300, 73, -54));
if (!portalBlock || portalBlock.name !== 'nether_portal') {
  console.log('Portal not lit yet. Sill at (299, 72, -54) is:', bot.blockAt(new Vec3(299, 72, -54))?.name);
  for (const [name, p] of Object.entries(bot.players)) {
    if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
  return { status: 'waiting_for_portal', sill: bot.blockAt(new Vec3(299, 72, -54))?.name };
}

console.log('PORTAL IS OFFICIALLY LIT! Active nether_portal block confirmed!');
bot.chat('gamma: Portal ignited! Stepping onto sill (299.5, 73.0, -53.5) for survival Nether warp!');

// Step 2: Step onto portal sill at (299.5, 73.0, -53.5)
await bot.lookAt(new Vec3(299.5, 73.0, -53.5), true);
try {
  await lib.goTo(299.5, 73.0, -53.5, 0.6, { timeoutMs: 5000 });
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

// Step 3: Step out into Nether bunker
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

bot.chat(`gamma: Arrived in the_nether at ${lib.fmt(bot.entity.position)}! Marching safe East Ridge to Fortress Workshop Bunker (44, 65, -127)!`);

// Step 4: March East Ridge Waypoints to Bunker
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

// Step 5: Inside bunker at (44, 65, -128)
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
