console.log('=== Program 913: Scan Wider Animals ===');
const animals = Object.values(bot.entities).filter(e =>
  e.isValid && (
    e.name === 'cow' ||
    e.name === 'pig' ||
    e.name === 'sheep' ||
    e.name === 'chicken'
  )
);
console.log(`Passive animals within render distance (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}
