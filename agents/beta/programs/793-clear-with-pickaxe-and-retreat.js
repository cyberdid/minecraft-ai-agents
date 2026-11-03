// programs/793-clear-with-pickaxe-and-retreat.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 793: Equip Pickaxe, Clear Path & Warp to Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) {
  await bot.equip(pick, 'hand');
  console.log(`Equipped ${pick.name} in hand!`);
}

// 2. Ensure golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); console.log('Equipped golden_boots on feet'); } catch (e) {}
  }
}

// 3. Clear tight spot around z=-34
const clearTargets = [
  new Vec3(62, 65, -34),
  new Vec3(62, 66, -34),
  new Vec3(64, 65, -34),
  new Vec3(64, 66, -34),
  new Vec3(64, 65, -33),
  new Vec3(64, 66, -33)
];

for (const target of clearTargets) {
  const b = bot.blockAt(target);
  if (b && b.boundingBox === 'block') {
    console.log(`Mining ${b.name} at ${lib.fmt(target)}...`);
    try {
      await bot.dig(b, true);
      console.log(`Mined ${b.name} successfully!`);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(target)}:`, e.message);
    }
  }
}

// 4. Extinguish nearby fires
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 6,
  count: 8
});
for (const fp of fires) {
  try {
    const fb = bot.blockAt(fp);
    if (fb) await bot.dig(fb, true);
  } catch (e) {}
}

// 5. Shift to (63.0, 65.0, -32.0)
console.log('Moving into corridor at (63.0, 65.0, -32.0)...');
await bot.lookAt(new Vec3(63.0, 65.0, -32.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);
console.log('Pos after initial push:', lib.fmt(bot.entity.position));

// 6. March waypoints south to portal
const waypoints = [
  new Vec3(63.0, 65.0, -20.0),
  new Vec3(63.0, 64.0, -7.0),
  new Vec3(54.0, 65.0, -7.0),
  new Vec3(46.0, 65.0, -7.0),
  new Vec3(46.5, 66.0, 2.0)
];

// Configure pathfinder with canDig = true so it can dig through any minor obstacles
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;
  console.log(`Pathfinding to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}`);

  // Extinguish fire
  const f = bot.findBlocks({ matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'), maxDistance: 5, count: 5 });
  for (const fp of f) { try { await bot.dig(bot.blockAt(fp), true); } catch (e) {} }

  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    console.log(`Retry WP ${i + 1}:`, e.message);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }
}

// 7. Enter portal
console.log('Searching for portal block...');
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 10, count: 10 });
if (portals.length > 0) {
  portals.sort((a, b) => bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  const p = portals[0];
  const pCenter = p.offset(0.5, 0.2, 0.5);
  console.log(`Entering portal at ${lib.fmt(pCenter)}`);
  await bot.lookAt(pCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < p.y) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      await sleep(150);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, food: bot.food };
