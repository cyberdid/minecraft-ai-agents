// programs/567-scan-animals.js
console.log('=== SCAN ANIMALS NEAR BASE ===');
const animals = Object.values(bot.entities).filter(e =>
  e.isValid && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name)
);
console.log(`Found ${animals.length} animals:`);
for (const a of animals) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)}, dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}
