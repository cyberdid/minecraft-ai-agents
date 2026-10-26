// programs/229-check-status-and-team.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Check players equipment
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const held = p.entity.heldItem?.name || 'empty';
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding ${held}`);
  }
}

// Check nearby chests or containers within 35m
const chests = bot.findBlocks({
  matching: b => b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel',
  maxDistance: 40,
  count: 5
});
console.log('Nearby chests:', chests.map(c => lib.fmt(c)));

// Check dropped items nearby
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 30);
console.log('Dropped items nearby:', items.map(i => `${i.metadata?.[8]?.itemId || 'item'} at ${lib.fmt(i.position)}`));
