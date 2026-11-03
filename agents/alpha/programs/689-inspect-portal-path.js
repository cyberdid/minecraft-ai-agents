// programs/689-inspect-portal-path.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// Scan for nether_portal with maxDistance: 32
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 32, count: 10 });
console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)));

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Target portal: ${lib.fmt(p)}, distance: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
  
  // Check if pathfinder can find a route up to portal
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allow1by1towers = true;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
  
  console.log('Pathfinding up to portal...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 0.8));
    console.log('Successfully reached portal! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Pathfind error:', e.message);
  }
}
