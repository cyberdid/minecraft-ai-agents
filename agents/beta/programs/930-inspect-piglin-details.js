console.log('=== Program 930: Inspect Piglin Details ===');
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 5.0
);
console.log(`Piglins within 5m: ${piglins.length}`);
for (const p of piglins) {
  console.log(`Piglin id=${p.id} at ${lib.fmt(p.position)}:`);
  console.log(`  height=${p.height}, width=${p.width}`);
  console.log(`  heldItem=${p.heldItem ? p.heldItem.name : 'none'}`);
  console.log(`  metadata=`, JSON.stringify(p.metadata));
}
