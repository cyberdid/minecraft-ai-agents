// programs/115-mine-east-hill-iron.js
// Answer Beta and travel to east hill (340, 75, -30) to mine iron ore together!

console.log('alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

bot.chat('alpha: We need 6 iron for my chestplate, and 23 iron for your armor, bucket, and pickaxe (29 total). Mining east hill at (340, 75, -30)!');

// Step outside base cleanly
await passDoorOut();
console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));

// Travel to east hill (340, 75, -30)
console.log('Travelling to east hill at (340, 75, -30)...');
try {
  await lib.goTo(340, 75, -30, 3);
} catch (e) {
  console.log('GoTo note:', e.message);
  await lib.goToXZ(340, -30);
}

console.log('Arrived at east hill! Alpha pos:', lib.fmt(bot.entity.position));

// Scan for iron ore on the surface hill
console.log('Scanning for iron ore...');
let mined = 0;
while (!isCancelled() && lib.count('raw_iron') < 15 && lib.time().secondsUntilNight > 110) {
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 15 })
    .filter(b => Math.abs(b.position.y - bot.entity.position.y) <= 8);
  
  if (ores.length === 0) {
    console.log('No exposed iron ore within 8 vertical blocks, exploring slightly...');
    await lib.goToXZ(bot.entity.position.x + 8, bot.entity.position.z + 6).catch(() => {});
    continue;
  }
  
  for (const ore of ores) {
    if (isCancelled() || lib.time().secondsUntilNight <= 110 || lib.count('raw_iron') >= 15) break;
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

console.log(`Mining session finished. Mined ${mined} iron. Raw iron in inventory: ${lib.count('raw_iron')}`);

// Return to base before dusk
if (lib.time().secondsUntilNight < 130 || lib.count('raw_iron') >= 15) {
  console.log('Returning to base entrance at (294, 72, -52)...');
  try {
    await lib.goToXZ(294, -52);
    await passDoorIn();
    console.log('Safely inside base!');
  } catch (e) {
    console.log('Return note:', e.message);
    if (lib.time().secondsUntilNight < 90) await lib.shelter();
  }
}

console.log('Alpha pos:', lib.fmt(bot.entity.position), '| raw_iron:', lib.count('raw_iron'), '| time:', lib.time().timeOfDay);
bot.chat(`alpha: East hill mining done! Raw iron: ${lib.count('raw_iron')}. Heading back to base.`);
