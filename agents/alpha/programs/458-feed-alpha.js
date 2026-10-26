// programs/458-feed-alpha.js
console.log('=== Program 458: Emergency Food & Return to Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Craft stone_sword if we can (Alpha has 6 cobble, 4 sticks, 5 planks)
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}
await lib.equipWeapon();

// 2. Look for any edible animal within 32m
const animals = ['cow', 'pig', 'sheep', 'chicken'];
const nearbyAnimal = bot.nearestEntity(e => animals.includes(e.name) && e.position.distanceTo(bot.entity.position) < 32);

if (nearbyAnimal) {
  console.log(`Found ${nearbyAnimal.name} at ${lib.fmt(nearbyAnimal.position)}! Attacking for food...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(nearbyAnimal.position.x, nearbyAnimal.position.y, nearbyAnimal.position.z, 2));
    for (let hit = 0; hit < 6; hit++) {
      if (!nearbyAnimal.isValid) break;
      await lib.equipWeapon();
      bot.attack(nearbyAnimal);
      await sleep(650);
    }
    await sleep(500);
    await lib.pickup(6);
  } catch (err) {
    console.log('Attack note:', err.message);
  }
}

// 3. Eat whatever food is in inventory
console.log('Inventory before eat:', JSON.stringify(lib.inv()));
const foodItem = bot.inventory.items().find(i => ['beef', 'porkchop', 'mutton', 'chicken', 'apple', 'bread'].includes(i.name));
if (foodItem) {
  console.log(`Eating ${foodItem.name}...`);
  try {
    await lib.eat();
    console.log('Food after eating:', bot.food);
  } catch (err) {
    console.log('Eat note:', err.message);
  }
}

// 4. Navigate back towards base (294, 72, -54)
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, navigating towards Base (294, 72, -54)...`);
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, night in ${t.secondsUntilNight}s`);

try {
  // Use goToXZ to travel overland efficiently
  await lib.goToXZ(294, -54);
} catch (err) {
  console.log('goToXZ note:', err.message);
}

console.log('Arrived at:', lib.fmt(bot.entity.position));

// 5. If near base door, enter base
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 15) {
  try {
    await passDoorIn();
    console.log('Safely inside base!');
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }
}

console.log('SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
