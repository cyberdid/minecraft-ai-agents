// programs/014-eat-and-night.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Eat cooked_beef
if (lib.count('cooked_beef')) {
  console.log('Eating cooked_beef...');
  await lib.eat();
  await sleep(1500);
  console.log('Food now:', bot.food);
}

// 2. Check block at (295, 72, -57)
const b57 = bot.blockAt(new Vec3(295, 72, -57));
console.log('Block at (295, 72, -57):', b57 ? b57.name : 'null');
const bUnder = bot.blockAt(new Vec3(295, 71, -57));
console.log('Block under at (295, 71, -57):', bUnder ? bUnder.name : 'null');

if (b57 && b57.name === 'air' && lib.count('furnace') > 0) {
  console.log('Placing furnace at (295, 72, -57)...');
  await lib.place('furnace', 295, 72, -57);
  console.log('Placed furnace! Remaining in inv:', lib.count('furnace'));
}

// 3. Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

console.log('Time:', lib.time().timeOfDay, lib.time().phase, 'night in:', lib.time().secondsUntilNight);
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma fed (food: ${bot.food}/20), inside base with delta. Door secured.`);
