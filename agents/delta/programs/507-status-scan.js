// programs/507-status-scan.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== DELTA STATUS SCAN ===');
console.log(`Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, lib.inv());

// Teammates positions
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: at ${lib.fmt(p.entity.position)} in dimension`);
  } else {
    console.log(`Teammate ${name}: ${p ? 'online (entity not in range)' : 'offline'}`);
  }
}

// Check nearby entities within 32 blocks (piglins, items, blazes, endermen)
const nearby = Object.values(bot.entities).filter(e => e && e !== bot.entity && bot.entity.position.distanceTo(e.position) <= 32);
console.log(`Nearby entities (${nearby.length}):`);
for (const e of nearby) {
  if (['piglin', 'piglin_brute', 'zombified_piglin', 'blaze', 'enderman', 'wither_skeleton', 'item'].includes(e.name)) {
    console.log(` - ${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m)`);
  }
}

return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, inv: lib.inv() };
