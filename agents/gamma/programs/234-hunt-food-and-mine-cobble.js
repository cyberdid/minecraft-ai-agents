// programs/234-hunt-food-and-mine-cobble.js
console.log('=== HUNT FOOD AND MINE COBBLESTONE ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Search for animals
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position.distanceTo(bot.entity.position) < 80
);
console.log(`Animals in 80m (${animals.length}):`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

// If animals found, hunt nearest
if (animals.length > 0) {
  const target = animals[0];
  console.log(`Hunting ${target.name}...`);
  try {
    await lib.hunt(target.name, 2);
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
} else {
  console.log('No animals visible in 80m. Exploring east/south for animals...');
  try {
    await lib.explore(1, 0, 15, () => {
      return Object.values(bot.entities).find(e => ['cow', 'pig', 'sheep'].includes(e.name));
    });
  } catch (e) {
    console.log('Explore note:', e.message);
  }
}

// 2. Mine 32 cobblestone on the hillside (stay at y >= 65, never dig into aquifer)
console.log('Mining cobblestone on hillside...');
try {
  await lib.collect('stone', 32, { maxBelow: 4 });
} catch (e) {
  console.log('Cobble collect note:', e.message);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 3. Return to base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return door error:', e.message);
}

// 4. Smelt any raw meat in base furnace at (295, 72, -55)
const rawMeats = ['beef', 'porkchop', 'mutton', 'chicken'];
for (const rm of rawMeats) {
  const count = lib.count(rm);
  if (count > 0 && lib.count('coal') > 0) {
    console.log(`Smelting ${count} ${rm}...`);
    try {
      await lib.smelt(rm, 'coal', count);
    } catch (e) {
      console.log(`Smelt ${rm} error:`, e.message);
    }
  }
}

// 5. Eat to full health
try {
  await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Status at end:');
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
