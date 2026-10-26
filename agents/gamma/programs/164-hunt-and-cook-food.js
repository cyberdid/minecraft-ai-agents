// programs/164-hunt-and-cook-food.js
console.log('--- HUNT FOOD AND COOK AT BASE ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Food:', bot.food, 'Health:', bot.health);
console.log('Time:', JSON.stringify(lib.time()));

// 1. Exit base
await lib.goThroughDoor(294, 72, -54);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// Equip weapon
await lib.equipWeapon();

// 2. Scan for animals nearby
const animals = ['cow', 'pig', 'sheep', 'chicken'];
for (const animal of animals) {
  if (lib.time().secondsUntilNight < 120) break;
  const count = bot.entities ? Object.values(bot.entities).filter(e => e.name === animal && e.position.distanceTo(bot.entity.position) < 40).length : 0;
  console.log(`Found ${count} ${animal}s within 40 blocks`);
  if (count > 0) {
    try {
      console.log(`Hunting 2 ${animal}s...`);
      await lib.hunt(animal, Math.min(count, 3));
      console.log(`Hunt report: inv=`, JSON.stringify(lib.inv()));
    } catch (e) {
      console.log(`Hunt ${animal} error:`, e.message);
    }
  }
}

// 3. Check for exposed iron_ore or coal_ore nearby if daylight permits
if (lib.time().secondsUntilNight > 100) {
  const ironBlocks = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 24, count: 5 });
  console.log(`Found ${ironBlocks.length} iron ore nearby.`);
  if (ironBlocks.length > 0) {
    try {
      await lib.collect(['iron_ore', 'deepslate_iron_ore'], Math.min(ironBlocks.length, 4));
      console.log('Collected iron ore! Inv:', JSON.stringify(lib.inv()));
    } catch (e) {
      console.log('Iron collect error:', e.message);
    }
  }
}

// 4. Return to base before dusk
console.log('Returning to base at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);
await lib.goThroughDoor(294, 72, -54);
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 5. Cook raw meat in base furnace at (295, 72, -55)
const rawMeats = ['beef', 'porkchop', 'mutton', 'chicken'].filter(m => lib.count(m) > 0);
for (const meat of rawMeats) {
  const count = lib.count(meat);
  console.log(`Cooking ${count} ${meat}...`);
  try {
    // Use oak_log or birch_planks or stick as fuel
    const fuel = lib.count('birch_planks') > 0 ? 'birch_planks' : (lib.count('oak_log') > 0 ? 'oak_log' : 'stick');
    await lib.smelt(meat, fuel, count);
    console.log(`Smelted ${meat}! Inv:`, JSON.stringify(lib.inv()));
  } catch (e) {
    console.log(`Smelt ${meat} error:`, e.message);
  }
}

// If we collected raw_iron, smelt it too!
if (lib.count('raw_iron') > 0) {
  const count = lib.count('raw_iron');
  console.log(`Smelting ${count} raw_iron...`);
  try {
    const fuel = lib.count('birch_planks') > 0 ? 'birch_planks' : 'oak_log';
    await lib.smelt('raw_iron', fuel, count);
    console.log('Iron ingots smelted! Count:', lib.count('iron_ingot'));
    if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
      await lib.craft('shield', 1);
      await lib.equipArmor();
      console.log('SHIELD CRAFTED AND EQUIPPED!');
    }
  } catch (e) {
    console.log('Iron smelt error:', e.message);
  }
}

// 6. Eat cooked food to restore hunger
const cookedFoods = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken'].filter(f => lib.count(f) > 0);
if (cookedFoods.length > 0 && bot.food < 20) {
  console.log('Eating cooked food...');
  try {
    await lib.eat();
    console.log('Food level now:', bot.food);
  } catch (e) {
    console.log('Eat error:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final health:', bot.health, 'Food:', bot.food);
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final time:', JSON.stringify(lib.time()));

bot.chat(`gamma has ${lib.count('cooked_*')} cooked food, HP: ${bot.health}, Food: ${bot.food}. Inside base!`);
