console.log('=== Program 898: Locate Obsidian & Check Entities ===');
globalThis.isProgramCancelled = isCancelled;

const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 64,
  count: 40
});
console.log(`Obsidian blocks count: ${obs.length}`);
for (const p of obs) {
  console.log(`  obsidian at ${lib.fmt(p)}`);
}

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 64,
  count: 20
});
console.log(`Portal blocks count: ${portals.length}`);
for (const p of portals) {
  console.log(`  portal at ${lib.fmt(p)}`);
}

for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  } else {
    console.log(`Player ${p.username}: entity null`);
  }
}
