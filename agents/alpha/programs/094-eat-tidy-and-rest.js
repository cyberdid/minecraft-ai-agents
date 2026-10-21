// programs/094-eat-tidy-and-rest.js
// 1. Eat remaining cooked chicken to reach max saturation & 20 health
// 2. Deposit clutter into base chest at (293, 72, -57)
// 3. Remind Beta about lib.makeObsidian in chat

console.log('alpha health before:', bot.health, '| food:', bot.food);

// 1. Eat cooked chicken
if (lib.count('cooked_chicken') > 0) {
  console.log('Eating cooked chicken...');
  await lib.eat();
}

// 2. Deposit clutter
console.log('Depositing clutter into base chest...');
try {
  await lib.deposit({
    feather: 'all',
    egg: 'all',
    leather: 'all',
    crafting_table: 'all'
  }, 293, 72, -57);
} catch (e) {
  console.log('Deposit error:', e.message);
}

// 3. Chat tip to Beta
bot.chat('beta: tip: lib.makeObsidian(2) pours water on lava pool edge, scoops water back, and mines obsidian!');

console.log('Alpha status: health:', bot.health, '| food:', bot.food, '| night in:', lib.time().secondsUntilNight);
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
