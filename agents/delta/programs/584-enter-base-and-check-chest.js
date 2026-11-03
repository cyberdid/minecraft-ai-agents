console.log('=== ENTER BASE AND CHECK CHEST ===');

// Step through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage:', e.message);
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -56.5, 1.2));
} catch (e) {
  console.log('Goto chest error:', e.message);
}

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openChest(chestBlock);
  const items = chest.items();
  console.log('CHEST CONTENTS:');
  for (const item of items) {
    console.log(`  ${item.name} x${item.count}`);
  }
  
  // Check for obsidian
  const obs = items.find(i => i.name === 'obsidian');
  if (obs) {
    console.log(`Found ${obs.count} obsidian in chest! Withdrawing 1...`);
    await chest.withdraw(obs.type, null, 1);
  }

  // Check for food if hunger low
  const foodItems = items.filter(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple'].includes(i.name));
  if (foodItems.length > 0) {
    console.log(`Found food: ${foodItems.map(f => `${f.name}x${f.count}`).join(', ')}`);
    // Withdraw up to 4 food
    await chest.withdraw(foodItems[0].type, null, Math.min(foodItems[0].count, 4));
  }

  // Check for bucket or water_bucket
  const bucket = items.find(i => i.name === 'bucket' || i.name === 'water_bucket');
  if (bucket) {
    console.log(`Found bucket: ${bucket.name}`);
  }

  await chest.close();
} else {
  console.log('Chest block not found at (293, 72, -57)!');
}

// Check local inventory
console.log('Delta inventory after chest:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// If we got food, eat it
const myFood = bot.inventory.items().find(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple'].includes(i.name));
if (myFood && bot.food < 18) {
  console.log(`Eating ${myFood.name}...`);
  try {
    await bot.equip(myFood, 'hand');
    await bot.consume();
    console.log(`Food level after eating: ${bot.food}`);
  } catch (e) {
    console.log('Eat error:', e.message);
  }
}

