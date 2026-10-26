// programs/138-eat-and-return-to-base.js
console.log('--- Eating and returning to base ---');
console.log('Status before:', bot.health, 'HP,', bot.food, 'food | Pos:', lib.fmt(bot.entity.position));

// Reliable eating function that holds right-click for 35 ticks (1.75s)
async function eatHeldItem() {
  console.log('Equipping mutton...');
  const item = bot.inventory.items().find(i => i.name === 'mutton');
  if (!item) {
    console.log('No mutton found');
    return false;
  }
  await bot.equip(item, 'hand');
  console.log('Holding use item...');
  bot.deactivateItem();
  bot.activateItem();
  
  const startFood = bot.food;
  const startCount = bot.inventory.count(item.type);
  
  for (let i = 0; i < 40; i++) {
    await sleep(100);
    if (bot.food > startFood || bot.inventory.count(item.type) < startCount) {
      console.log(`Finished eating at tick ${i}! Food: ${bot.food}`);
      bot.deactivateItem();
      return true;
    }
  }
  bot.deactivateItem();
  console.log('Eating finished or timed out, food now:', bot.food);
  return bot.food > startFood;
}

if (bot.food < 18 && lib.count('mutton') > 0) {
  await eatHeldItem();
}

console.log('After eat attempt:', bot.health, 'HP,', bot.food, 'food');

// Return to base
console.log('Returning to base at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);

console.log('At base door. Entering...');
try {
  await passDoorIn();
} catch (e) {
  console.log('passDoorIn error:', e.message, '- trying lib.goThroughDoor');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor error:', e2.message);
  }
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
console.log('Current inventory:', JSON.stringify(lib.inv()));
bot.chat('alpha: Inside base, checking furnaces and supplies.');
