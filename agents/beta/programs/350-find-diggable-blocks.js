// programs/350-find-diggable-blocks.js
console.log('=== Find diggable dirt/gravel/loose blocks around (303, 16, -41) ===');
const p = bot.entity.position.floored();

const diggables = bot.findBlocks({
  matching: b => ['dirt', 'gravel', 'sand', 'coarse_dirt'].includes(b.name),
  maxDistance: 6,
  count: 20
});

console.log(`Found ${diggables.length} soft blocks nearby:`);
for (const pos of diggables) {
  const b = bot.blockAt(pos);
  console.log(`  ${b.name} at ${lib.fmt(pos)}, dist: ${bot.entity.position.distanceTo(pos).toFixed(1)}m`);
}

// Check nearby players
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && e.type === 'player' && e.username !== bot.username) {
    console.log(`Player ${e.username} at ${lib.fmt(e.position)}`);
  }
}
