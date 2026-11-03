// programs/392-check-team-and-south-plains.js
console.log('=== CHECK TEAM & FOOD STATUS ===');
console.log('gamma pos:', lib.fmt(bot.entity.position), 'food:', bot.food, 'hp:', bot.health);

// 1. Check all teammates
for (const name of ['alpha', 'beta', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)} dist=${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  } else if (p) {
    console.log(`Teammate ${name}: online (not rendered)`);
  } else {
    console.log(`Teammate ${name}: offline`);
  }
}

// 2. Check all chests within 32 blocks
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 32, count: 10 });
console.log(`Found ${chests.length} chests nearby:`, chests.map(c => lib.fmt(c)));
for (const c of chests) {
  try {
    const items = await lib.chestContents(c.x, c.y, c.z);
    console.log(`Chest at ${lib.fmt(c)}:`, JSON.stringify(items));
  } catch (e) {
    console.log(`Error reading chest at ${lib.fmt(c)}:`, e.message);
  }
}

// 3. Scan south towards z=0..30 for animals (cows/pigs/sheep)
const animals = Object.values(bot.entities).filter(e =>
  (e.name === 'cow' || e.name === 'pig' || e.name === 'sheep' || e.name === 'chicken') &&
  e.position.distanceTo(bot.entity.position) < 80
);
console.log(`Animals within 80m: ${animals.length}`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

return { food: bot.food, chests: chests.length, animals: animals.length };
