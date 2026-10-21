// programs/070-mine-iron-and-food.js
// 1. Exit base through door
// 2. Chop 4 logs for fuel
// 3. Hunt 2-3 animals on the way
// 4. Head to east hill (350, -35), find and mine 8-12 raw iron
// 5. Return safely to base before night (secondsUntilNight < 120)

console.log('alpha leaving base for wood, food, and iron...');
console.log('Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

bot.chat('alpha: Heading to east hill to mine 8 iron for chestplate and hunt food.');

// 1. Step through door
await lib.goThroughDoor(294, 72, -54);

// 2. Chop 4 logs
console.log('Collecting logs near base for fuel...');
try {
  await lib.collect('*_log', 4);
} catch (e) {
  console.log('Wood collect note:', e.message);
}

// 3. Hunt animals if nearby
console.log('Checking for animals...');
for (const mob of ['cow', 'pig', 'sheep']) {
  if (lib.time().secondsUntilNight < 180) break;
  try {
    const entity = bot.nearestEntity(e => e.name === mob && e.position.distanceTo(bot.entity.position) < 32);
    if (entity) {
      console.log(`Hunting ${mob}...`);
      await lib.hunt(mob, 1);
    }
  } catch (e) {
    console.log(`Hunt ${mob} note:`, e.message);
  }
}

// 4. Head toward east hill (350, -35)
console.log('Heading toward east hill (350, -35)...');
try {
  await lib.goToXZ(350, -35);
} catch (e) {
  console.log('GoToXZ note:', e.message);
}

// 5. Mine iron ore
console.log('Scanning for iron ore...');
let mined = 0;
while (!isCancelled() && lib.count('raw_iron') < 10 && lib.time().secondsUntilNight > 120) {
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 10 });
  if (ores.length === 0) {
    console.log('No ore within 32 blocks, scanning wider...');
    break;
  }
  for (const ore of ores) {
    if (isCancelled() || lib.time().secondsUntilNight <= 120 || lib.count('raw_iron') >= 10) break;
    try {
      console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
      mined++;
    } catch (e) {
      console.log(`Mine error at ${lib.fmt(ore.position)}:`, e.message);
    }
  }
}

console.log(`Mined ${mined} iron ore blocks. Raw iron count: ${lib.count('raw_iron')}`);

// 6. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -53);
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return note:', e.message);
  // Emergency fallback
  if (lib.time().secondsUntilNight < 90) {
    console.log('Night close, seeking shelter...');
    await lib.shelter();
  }
}

console.log('Status at end: time:', lib.time().timeOfDay, '| raw iron:', lib.count('raw_iron'), '| pos:', lib.fmt(bot.entity.position));
