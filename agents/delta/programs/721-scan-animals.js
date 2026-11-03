console.log('=== PROGRAM 721: SCAN ANIMALS NEAR BASE ===');
const animals = Object.values(bot.entities).filter(e =>
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 32
);

console.log(`Animals within 32m of base: ${animals.length}`);
for (const a of animals) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// Check what items are in Delta's inventory
console.log('Delta Inv:', lib.inv());
console.log('Delta HP:', bot.health, 'Food:', bot.food);
