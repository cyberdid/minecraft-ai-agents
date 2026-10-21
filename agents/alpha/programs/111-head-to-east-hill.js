// programs/111-head-to-east-hill.js
// Set spawn, step out cleanly, and travel to east hill at (340, 75, -30) to mine 6+ iron ore

console.log('alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

// Set spawn at base bed
try {
  await lib.setSpawn();
  console.log('Spawn confirmed at base bed!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// Step outside cleanly
await passDoorOut();
console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));

bot.chat('alpha: Heading to east hill at (340, 75, -30) to meet beta and mine 6 iron for chestplate.');

// Travel to east hill (340, 75, -30)
console.log('Travelling to east hill...');
try {
  await lib.goTo(340, 75, -30, 3);
  console.log('Arrived at east hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
  await lib.goToXZ(340, -30);
}

console.log('Alpha at east hill:', lib.fmt(bot.entity.position));
