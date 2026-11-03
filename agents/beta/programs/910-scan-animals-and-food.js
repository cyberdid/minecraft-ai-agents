console.log('=== Program 910: Scan Animals & Food ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Beta pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

const animals = Object.values(bot.entities).filter(e =>
  e.isValid && (
    e.name === 'cow' ||
    e.name === 'pig' ||
    e.name === 'sheep' ||
    e.name === 'chicken'
  )
);
console.log(`Passive animals nearby (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// Check for wheat / crops
const crops = bot.findBlocks({
  matching: b => b && (b.name === 'wheat' || b.name === 'carrots' || b.name === 'potatoes' || b.name === 'beetroots'),
  maxDistance: 48,
  count: 20
});
console.log(`Crops nearby (${crops.length}):`);
for (const c of crops) {
  console.log(`  ${bot.blockAt(c).name} at ${lib.fmt(c)}`);
}

// Also check Delta
const delta = Object.values(bot.players).find(p => p.username === 'delta');
if (delta && delta.entity) {
  console.log(`Delta at ${lib.fmt(delta.entity.position)}, dist: ${bot.entity.position.distanceTo(delta.entity.position).toFixed(1)}`);
}
