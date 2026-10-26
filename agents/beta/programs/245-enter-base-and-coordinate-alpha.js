// programs/245-enter-base-and-coordinate-alpha.js
console.log('=== Step 3: Enter base, check Alpha, check chest ===');

// Step through door into base
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  await lib.goTo(294, 72, -55, 1);
}

console.log('Inside base. Beta position:', lib.fmt(bot.entity.position));

// Check Alpha's status
const alphaPlayer = bot.players['alpha'];
if (alphaPlayer && alphaPlayer.entity) {
  console.log('Alpha is at:', lib.fmt(alphaPlayer.entity.position), 'distance:', alphaPlayer.entity.position.distanceTo(bot.entity.position).toFixed(1));
} else {
  console.log('Alpha entity not visible in loaded range.');
}

// Check chest contents again
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest contents:', JSON.stringify(chest));

console.log('Beta inv:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);

bot.chat('alpha: Inside base. Do you have any food or raw meat? I have logs and wood.');
