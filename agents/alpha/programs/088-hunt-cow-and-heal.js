// programs/088-hunt-cow-and-heal.js
// Hunt the cow at (282, 69, -92), return, cook beef, eat and heal

console.log('alpha health before:', bot.health, '| food:', bot.food);

bot.chat('alpha: Hunting cow at (282, 69, -92) to cook steak and heal.');

// 1. Exit base
await lib.goThroughDoor(294, 72, -54);

// 2. Hunt cow
console.log('Hunting cow...');
await lib.hunt('cow', 1);

// Also hunt chicken if nearby
try {
  await lib.hunt('chicken', 1);
} catch (e) {}

// 3. Return to base
console.log('Returning to base...');
await lib.goToXZ(294, -53);
await lib.goThroughDoor(294, 72, -54);

// 4. Cook beef
console.log('Raw beef count:', lib.count('beef'));
if (lib.count('beef') > 0) {
  if (lib.count('*_planks') < 2) {
    await lib.craft('oak_planks', 4);
  }
  await lib.smelt('beef', 'oak_planks', lib.count('beef'));
}

// 5. Eat steak
console.log('Eating cooked beef...');
await lib.eat();
if (lib.count('cooked_beef') > 0) {
  await lib.eat();
}

console.log('Alpha health after:', bot.health, '| food:', bot.food, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Healed! Health: ${Math.round(bot.health)}/20, Food: ${bot.food}/20.`);
