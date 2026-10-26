// programs/461-hunt-plains-west.js
console.log('=== Program 461: Hunt Plains West for Meat ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Equip stone_sword
await lib.equipWeapon();

// 2. Step outside base
console.log('Stepping outside base...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 3. Walk West towards plains at (265, 65, -50)
console.log('Walking West towards plains at (265, 65, -50)...');
try {
  await lib.goToXZ(265, -50);
} catch (e) {
  console.log('Walk note:', e.message);
}
console.log('Arrived at:', lib.fmt(bot.entity.position));

// 4. Look for animals within 32m
const animals = ['cow', 'pig', 'sheep', 'chicken'];
const targets = Object.values(bot.entities).filter(e => animals.includes(e.name) && e.position.distanceTo(bot.entity.position) < 32);
console.log(`Found ${targets.length} animals near (265, -50)`);

for (const animal of targets) {
  if (lib.count('*_beef') > 0 || lib.count('*_porkchop') > 0 || lib.count('*_mutton') > 0 || lib.count('*_chicken') > 0) break;
  console.log(`Hunting ${animal.name} at ${lib.fmt(animal.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(animal.position.x, animal.position.y, animal.position.z, 2));
    for (let h = 0; h < 5; h++) {
      if (!animal.isValid) break;
      await lib.equipWeapon();
      bot.attack(animal);
      await sleep(650);
    }
    await sleep(400);
    await lib.pickup(6);
  } catch (err) {
    console.log('Attack note:', err.message);
  }
}

console.log('Inventory after hunting:', JSON.stringify(lib.inv()));

// 5. Eat raw meat immediately to restore hunger!
for (const food of ['beef', 'porkchop', 'mutton', 'chicken']) {
  if (lib.count(food) > 0) {
    console.log(`Eating ${food}...`);
    try {
      await safeEat(food);
      console.log('Food restored to:', bot.food);
    } catch (e) {
      try { await lib.eat(); } catch (e2) {}
    }
  }
}

// 6. Return to base
console.log('Returning to base shelter at (294, 72, -53)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  await passDoorIn();
  console.log('Inside base!');
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha status: HP ${bot.health}/20, Food ${bot.food}/20. In base ready for Nether!`);
