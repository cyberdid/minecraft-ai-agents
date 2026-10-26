// programs/067-inspect-items.js
console.log('--- INSPECTING NEARBY ITEM DROPS ---');
const items = Object.values(bot.entities)
  .filter(e => e && e.name === 'item' && e.position)
  .map(e => {
    // In mineflayer, dropped items can be inspected
    const dropped = e.getDroppedItem ? e.getDroppedItem() : null;
    return {
      pos: lib.fmt(e.position),
      dist: e.position.distanceTo(bot.entity.position).toFixed(1),
      item: dropped ? `${dropped.name}x${dropped.count}` : 'unknown'
    };
  })
  .sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));

console.log(`Found ${items.length} item drops:`);
for (const it of items) {
  console.log(`- ${it.item} at ${it.pos} (${it.dist}m)`);
}

// Also check Delta
if (bot.players.delta && bot.players.delta.entity) {
  console.log('Delta is at:', lib.fmt(bot.players.delta.entity.position));
}
