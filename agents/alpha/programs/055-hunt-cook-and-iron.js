// programs/055-hunt-cook-and-iron.js
// Hunt 2 animals for meat, cook in furnace, eat to 20/20 food, sleep before night

console.log('alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food);

// 1. Hunt sheep or cows on surface grassland
const targetAnimal = bot.nearestEntity(e => ['sheep', 'cow', 'pig', 'chicken'].includes(e.name));
console.log('Nearest animal:', targetAnimal ? targetAnimal.name : 'none');

if (targetAnimal) {
  try {
    console.log(`Hunting ${targetAnimal.name}...`);
    await lib.hunt(targetAnimal.name, 2);
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// Check food collected
const meats = Object.keys(lib.inv()).filter(k => ['mutton', 'beef', 'porkchop', 'chicken'].includes(k));
console.log('Raw meats in inventory:', meats.map(m => `${m} x${lib.count(m)}`).join(', '));

// 2. Return to base doorstep at (294, 72, -52)
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Step inside base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Walking inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Cook meat in furnace at (295, 72, -55)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
for (const meat of meats) {
  const count = lib.count(meat);
  if (count > 0) {
    console.log(`Cooking ${count} ${meat} in furnace...`);
    try {
      await lib.smelt(meat, 'oak_planks', count);
    } catch (e) {
      console.log('Cook note:', e.message);
    }
  }
}

// 4. Eat cooked food
while (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Food now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
    break;
  }
}

console.log('Final food level:', bot.food, 'Health:', bot.health);

// 5. If night approaching, get in bed to sleep
if (lib.time().canSleep || lib.time().timeOfDay >= 12542) {
  bot.chat('alpha: In bed sleeping to skip night.');
  try {
    await lib.sleepInBed();
    console.log('In bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  food: bot.food,
  health: bot.health,
  time: time.secondsUntilNight
};
