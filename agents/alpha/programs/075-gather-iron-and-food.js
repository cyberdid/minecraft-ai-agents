// programs/075-gather-iron-and-food.js
// 1. Exit base through door
// 2. Chop 3-4 logs near base
// 3. Hunt 1-2 animals if seen
// 4. Head towards east hill (340, -30) to mine 8+ iron ore
// 5. Return safely when night is under 110s

console.log('alpha starting gather trip. Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);
bot.chat('alpha: Heading out to collect fuel wood, food, and mine 8 iron for chestplate.');

// 1. Exit base
await lib.goThroughDoor(294, 72, -54);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Chop 4 logs
try {
  console.log('Chopping logs...');
  const wood = await lib.collect('*_log', 4);
  console.log('Wood collected:', JSON.stringify(wood));
} catch (e) {
  console.log('Wood note:', e.message);
}

// 3. Hunt animal if nearby
for (const mob of ['cow', 'sheep', 'pig']) {
  if (lib.time().secondsUntilNight < 180) break;
  const e = bot.nearestEntity(ent => ent.name === mob && ent.position.distanceTo(bot.entity.position) < 25);
  if (e) {
    try {
      console.log(`Hunting ${mob}...`);
      await lib.hunt(mob, 1);
    } catch (err) {
      console.log(`Hunt ${mob} note:`, err.message);
    }
  }
}

// 4. Move to east hill at (340, -30)
console.log('Heading toward east hill (340, -30)...');
try {
  await lib.goToXZ(340, -30);
} catch (e) {
  console.log('GoToXZ note:', e.message);
}

// 5. Scan and mine iron
console.log('Mining iron...');
while (!isCancelled() && lib.count('raw_iron') < 9 && lib.time().secondsUntilNight > 110) {
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 10 });
  if (ores.length === 0) {
    console.log('No iron ore in 32m, scanning closer to hillside...');
    await lib.goToXZ(bot.entity.position.x + 8, bot.entity.position.z + 4);
    continue;
  }
  for (const ore of ores) {
    if (isCancelled() || lib.time().secondsUntilNight <= 110 || lib.count('raw_iron') >= 9) break;
    try {
      console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
    } catch (e) {
      console.log(`Mine error at ${lib.fmt(ore.position)}:`, e.message);
    }
  }
}

console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 6. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -53);
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return note:', e.message);
  if (lib.time().secondsUntilNight < 90) {
    console.log('Night near! Emergency shelter...');
    await lib.shelter();
  }
}

console.log('Finished step. Alpha at:', lib.fmt(bot.entity.position), '| time:', lib.time().timeOfDay, '| raw iron:', lib.count('raw_iron'));
bot.chat(`alpha: Returned to base with ${lib.count('raw_iron')} raw iron.`);
