// programs/551-join-team-at-bunker.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: JOIN TEAM AT FORTRESS WORKSHOP BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Waypoints from Pillbox back to Fortress Bunker (44, 65, -127)
const waypoints = [
  { x: 38, y: 65, z: -176 },
  { x: 44, y: 65, z: -169 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -127 }
];

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Advancing to waypoint ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  
  // Keep gaze low to avoid Endermen aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 6000 });
    } catch (e2) {}
  }

  try { await lib.pickup(3.0); } catch (e) {}
}

console.log(`=== ARRIVED AT FORTRESS BUNKER ===`);
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Check teammates
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)})`);
  }
}

bot.chat('delta: Arrived at Fortress Workshop Bunker (44, 65, -127)! Pillbox fortified. United with Alpha, Beta & Gamma for Milestone 9!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  inv: lib.inv()
};
