// programs/340-hunt-and-cook-food.js
console.log('=== Program 340: Hunt Food & Cook at Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Exit base to hunt
console.log('Exiting base to hunt...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Hunt cows or sheep North of base
bot.chat('team: Alpha hunting animals North of base for food supply!');
let meatsGathered = 0;

try {
  console.log('Hunting cows...');
  const gotCows = await lib.hunt('cow', 3);
  console.log('Hunted cows:', JSON.stringify(gotCows));
} catch (e) {
  console.log('Cow hunt note:', e.message);
  try {
    console.log('Hunting sheep / pigs...');
    const gotSheep = await lib.hunt('sheep', 2);
    console.log('Hunted sheep:', JSON.stringify(gotSheep));
  } catch (e2) {
    console.log('Sheep hunt note:', e2.message);
  }
}

console.log('Raw meats in inv:', lib.count('beef'), 'beef,', lib.count('mutton'), 'mutton,', lib.count('porkchop'), 'porkchop');

// 3. Return to base
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 25000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Back in base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Base return note:', e.message);
}

// 4. Cook raw meat in base furnace
for (const meat of ['beef', 'mutton', 'porkchop', 'chicken']) {
  const c = lib.count(meat);
  if (c > 0 && lib.count('coal') > 0) {
    console.log(`Cooking ${c} ${meat}...`);
    try {
      await lib.smelt(meat, 'coal', c);
    } catch (e) {
      console.log(`Cook ${meat} note:`, e.message);
    }
  }
}

// 5. Eat cooked food
for (const cooked of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken']) {
  if (lib.count(cooked) > 0) {
    console.log(`Eating ${cooked}...`);
    if (typeof safeEat === 'function') await safeEat(cooked);
    else await lib.eat();
    console.log(`Food now: ${bot.food}/20`);
    break;
  }
}

// Deposit spare cooked food into chest for Delta and Beta
try {
  const spareFood = {};
  for (const f of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop']) {
    if (lib.count(f) > 1) spareFood[f] = lib.count(f) - 1;
  }
  if (Object.keys(spareFood).length > 0) {
    console.log('Depositing spare food in chest:', JSON.stringify(spareFood));
    await lib.deposit(spareFood, 293, 72, -57);
  }
} catch (e) {}

console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha hunted and cooked food! Food level: ${bot.food}/20. Spare food deposited in chest!`);
