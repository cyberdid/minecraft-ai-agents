// programs/137-hunt-sheep-and-eat.js
console.log('--- Hunting sheep for food ---');
console.log('Current status:', bot.health, 'HP,', bot.food, 'food | night in', lib.time().secondsUntilNight, 's');

try {
  console.log('Hunting sheep...');
  const res = await lib.hunt('sheep', 1);
  console.log('Hunt result:', JSON.stringify(res));
} catch (e) {
  console.log('Hunt error:', e.message);
}

// Eat immediately whatever food was obtained
console.log('Eating...');
while (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Ate! Food now:', bot.food, 'Health:', bot.health);
  } catch (e) {
    console.log('Cannot eat more:', e.message);
    break;
  }
}

// Report
console.log('Status after hunt & eat: Health:', bot.health, 'Food:', bot.food, 'Inv:', JSON.stringify(lib.inv()));
