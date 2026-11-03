console.log('=== Program 900: Inspect Path to Active Portal (30, 75, -20) ===');
globalThis.isProgramCancelled = isCancelled;

const p = new Vec3(30, 75, -20);
console.log('Portal pos:', lib.fmt(p), 'Dist from Beta:', bot.entity.position.distanceTo(p).toFixed(1));

// Inspect the block below the portal
const below = bot.blockAt(p.offset(0, -1, 0));
console.log('Block below portal:', below ? below.name : 'null');

// Find path using pathfinder
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.allowSprinting = false;

const path = bot.pathfinder.getPathTo(moves, new goals.GoalNear(30, 75, -20, 1.0));
console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
if (path.path && path.path.length > 0) {
  console.log('Path start:', lib.fmt(path.path[0]), 'Path end:', lib.fmt(path.path[path.path.length - 1]));
}
