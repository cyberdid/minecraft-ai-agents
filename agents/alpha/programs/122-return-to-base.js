// programs/122-return-to-base.js
// Walk directly back to base at (294, 72, -54) from (136, 62, -5)

console.log('alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

bot.chat('alpha: Awesome work beta! I am returning to base from (136, -5) to help smelt and craft your armor.');

// 1. Return to base entrance
console.log('Travelling back to base entrance (294, 72, -52)...');
try {
  await lib.goToXZ(294, -52);
  console.log('Arrived at base entrance!');
} catch (e) {
  console.log('Travel note:', e.message);
  await lib.goTo(294, 72, -52, 2);
}

// 2. Step inside cleanly
console.log('Entering base...');
try {
  await passDoorIn();
  console.log('Safely inside base! Alpha at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door in note:', e.message);
}

bot.chat('alpha: Back inside base safe with you beta!');
console.log('Alpha status: health:', bot.health, '| food:', bot.food, '| pos:', lib.fmt(bot.entity.position));
