// programs/351-evade-witch-and-hunt.js
console.log('--- Step 1: Evade Witch and return to Base ---');
await lib.goTo(294, 72, -53, 2);
console.log('Safely reached base perimeter! Current pos:', lib.fmt(bot.entity.position));

console.log('--- Step 2: Scan for animals near base ---');
const animalTypes = ['cow', 'pig', 'sheep', 'chicken'];
let animals = [];
for (const e of Object.values(bot.entities)) {
  if (e && animalTypes.includes(e.name) && e.position.distanceTo(bot.entity.position) < 50) {
    // Only hunt if not near witch (x > 280)
    if (e.position.x > 280) {
      animals.push(e);
    }
  }
}
animals.sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));
console.log(`Found ${animals.length} animals near base:`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`).join(', '));

// Hunt up to 3 animals
for (let i = 0; i < Math.min(3, animals.length); i++) {
  const target = animals[i];
  if (!target || !target.isValid) continue;
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
    await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
    while (target.isValid && target.position.distanceTo(bot.entity.position) < 3.5) {
      bot.attack(target);
      await sleep(650);
    }
    await lib.pickup(6);
  } catch (err) {
    console.log(`Hunt ${target.name} note:`, err.message);
  }
}

console.log('--- Step 3: Enter base and cook meat ---');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

const rawFoods = ['beef', 'porkchop', 'mutton', 'chicken'].filter(f => lib.count(f) > 0);
console.log('Raw food in inventory:', rawFoods.map(f => `${f}: ${lib.count(f)}`));

if (rawFoods.length > 0) {
  for (const food of rawFoods) {
    const count = lib.count(food);
    console.log(`Cooking ${count}x ${food}...`);
    try {
      await lib.smelt(food, 'birch_planks', count);
    } catch (e) {
      console.log(`Smelt ${food} note:`, e.message);
    }
  }
}

// Eat food
console.log('Eating food if available...');
try {
  await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Status:', JSON.stringify(lib.status()));
