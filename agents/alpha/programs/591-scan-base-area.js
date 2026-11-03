// programs/591-scan-base-area.js
console.log('=== Program 591: Scan Base Area for Containers and Drops ===');

const containers = bot.findBlocks({
  matching: b => b.name.includes('chest') || b.name.includes('barrel') || b.name.includes('furnace'),
  maxDistance: 25,
  count: 20
});

console.log(`Found ${containers.length} containers:`);
for (const pos of containers) {
  const blk = bot.blockAt(pos);
  console.log(`- ${blk.name} at ${lib.fmt(pos)}`);
}

// Check dropped items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 25);
console.log(`Found ${items.length} dropped item entities within 25m:`);
for (const it of items) {
  console.log(`- dropped item at ${lib.fmt(it.position)}`);
}

// Also check players
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}
