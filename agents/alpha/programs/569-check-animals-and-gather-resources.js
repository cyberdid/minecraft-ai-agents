// programs/569-check-animals-and-gather-resources.js
console.log('=== Program 569: Check Animals & Surface Resources ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Find animals within 32m
const animals = Object.values(bot.entities).filter(e => 
  e.type === 'mob' && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position.distanceTo(bot.entity.position) < 48
);
console.log(`Found ${animals.length} animals within 48m:`, animals.map(a => `${a.name} at ${lib.fmt(a.position)} (${a.position.distanceTo(bot.entity.position).toFixed(1)}m)`));

// Find trees within 32m
const logs = lib.find('*_log', { maxDistance: 32, count: 5 });
console.log(`Found ${logs.length} logs nearby:`, logs.map(l => `${l.name} at ${lib.fmt(l.position)}`));

// Check surface stone near mine entrance (302, 71, -44)
console.log('Mine entrance at (302, 71, -44)...');
for (let y = 70; y <= 72; y++) {
  const b = bot.blockAt(new Vec3(302, y, -44));
  console.log(`(302, ${y}, -44): ${b?.name}`);
}
