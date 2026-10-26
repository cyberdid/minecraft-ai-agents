// programs/165-hunt-food.js
console.log('--- HUNT FOOD IN OVERWORLD ---');
console.log('Time:', JSON.stringify(lib.time()));

// 1. Exit base
await lib.goThroughDoor(294, 72, -54);
await lib.equipWeapon();

// 2. Hunt animals using lib.hunt (which explores up to 40s per mob)
const targets = ['sheep', 'cow', 'pig', 'chicken'];
let gotFood = false;

for (const target of targets) {
  if (lib.time().secondsUntilNight < 100) {
    console.log('Night approaching, returning to base!');
    break;
  }
  console.log(`Searching for ${target}...`);
  try {
    const report = await lib.hunt(target, 2);
    console.log(`Hunted ${target}:`, JSON.stringify(report));
    gotFood = true;
    break; // We got food!
  } catch (e) {
    console.log(`Could not find/hunt ${target}:`, e.message);
  }
}

// 3. Return to base
console.log('Returning to base...');
await lib.goTo(294, 72, -53, 1);
await lib.goThroughDoor(294, 72, -54);
console.log('Safely inside base!');

// 4. Smelt any raw meat
const rawMeats = ['mutton', 'beef', 'porkchop', 'chicken'].filter(m => lib.count(m) > 0);
for (const meat of rawMeats) {
  const count = lib.count(meat);
  console.log(`Smelting ${count} ${meat}...`);
  try {
    await lib.smelt(meat, 'birch_planks', count);
    console.log(`Smelted ${meat}! Count now:`, lib.count(`cooked_${meat}`));
  } catch (e) {
    console.log(`Smelt error:`, e.message);
  }
}

// 5. Eat to restore hunger if needed
if (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Ate food! Hunger is now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final health:', bot.health, 'Food:', bot.food);
bot.chat(`gamma has ${lib.count('cooked_*')} cooked food, HP: ${bot.health}, Food: ${bot.food}.`);
