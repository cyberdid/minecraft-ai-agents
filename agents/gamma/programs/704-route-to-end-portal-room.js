// programs/704-route-to-end-portal-room.js
globalThis.isProgramCancelled = isCancelled;

const portalCenter = new Vec3(2210.0, 0.0, 1470.0);
console.log(`=== ROUTE TO END PORTAL ROOM AT ${lib.fmt(portalCenter)} ===`);
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('team: END PORTAL LOCATED AT (2210, 0, 1470)! 12 frames confirmed at y=0! All players march to Portal Room!');

// Configure pathfinder movements
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

console.log('Testing pathfinder route to End Portal room...');
const p = bot.pathfinder.getPathTo(moves, new goals.GoalNear(portalCenter.x, 1.0, portalCenter.z, 2.0));
console.log(`Path status: ${p.status}, length: ${p.path?.length}`);

if (p.status === 'success' && p.path && p.path.length > 0) {
  console.log(`Pathfinder found direct route with ${p.path.length} nodes! Executing...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalCenter.x, 1.0, portalCenter.z, 2.0));
  } catch (err) {
    console.log('goto err:', err.message);
  }
} else {
  console.log('No direct open pathfinder path, checking corridors or digging staircase...');
  // Inspect surface / blocks directly above (2210, y, 1470)
  for (let y = 35; y >= 0; y -= 5) {
    const b = bot.blockAt(new Vec3(2210, y, 1470));
    console.log(`(2210, ${y}, 1470): ${b?.name}`);
  }
}

console.log('Gamma Pos now:', lib.fmt(bot.entity.position));
return { pos: bot.entity.position, hp: bot.health, portalCenter };
