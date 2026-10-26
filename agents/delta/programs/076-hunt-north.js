// programs/076-hunt-north.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Food:', bot.food, 'Health:', bot.health);

const basePos = new Vec3(294, 72, -54);

// Function to find nearest animal
function findNearestAnimal() {
  const animals = [];
  for (const id in bot.entities) {
    const e = bot.entities[id];
    if (!e || !e.position) continue;
    if (['chicken', 'cow', 'sheep', 'pig', 'rabbit'].includes(e.name)) {
      const d = bot.entity.position.distanceTo(e.position);
      animals.push({ e, d, name: e.name, pos: e.position });
    }
  }
  animals.sort((a, b) => a.d - b.d);
  return animals[0] || null;
}

// Function to safely check time
function checkTime() {
  const t = lib.time();
  console.log(`Time: ${t.timeOfDay}, night in ${t.secondsUntilNight}s`);
  return t.secondsUntilNight;
}

// Move in stages towards (298, 72, -175)
const waypoints = [
  new Vec3(298, 72, -120),
  new Vec3(298, 72, -150),
  new Vec3(298, 72, -175)
];

for (const wp of waypoints) {
  if (checkTime() < 120) {
    console.log('Night approaching (<120s), aborting advance!');
    break;
  }
  
  // Check if an animal is already close
  let animal = findNearestAnimal();
  if (animal && animal.d < 25) {
    console.log(`Found ${animal.name} at dist ${Math.round(animal.d)}, closing in to hunt!`);
    break;
  }

  console.log(`Walking to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (err) {
    console.log(`Waypoint ${lib.fmt(wp)} navigation note:`, err.message);
  }
}

// Now hunt any nearby animals
let meatGained = 0;
for (let attempt = 0; attempt < 5; attempt++) {
  if (checkTime() < 120) break;
  const target = findNearestAnimal();
  if (!target || target.d > 40) {
    console.log('No animals within 40 blocks.');
    break;
  }

  console.log(`Hunting ${target.name} at ${lib.fmt(target.pos)} (dist ${Math.round(target.d)})...`);
  await lib.equipWeapon();
  
  const id = target.e.id;
  bot.pvp.attack(target.e);
  const deadline = Date.now() + 15000;
  while (bot.entities[id] && Date.now() < deadline && !isCancelled()) {
    await sleep(250);
  }
  bot.pvp.stop();
  await sleep(600);
  const picked = await lib.pickup(6);
  console.log(`Killed! Picked up ${picked} items.`);
  meatGained++;
}

console.log('Meat hunt phase complete. Inventory now:', JSON.stringify(lib.inv()));

// If we got chicken/beef/mutton/porkchop and have furnace & coal, cook it!
const rawFoods = ['chicken', 'beef', 'mutton', 'porkchop'].filter(f => lib.count(f) > 0);
if (rawFoods.length > 0 && lib.count('furnace') > 0 && lib.count('coal') > 0 && checkTime() > 90) {
  const foodItem = rawFoods[0];
  const count = lib.count(foodItem);
  console.log(`Cooking ${count} ${foodItem}...`);
  try {
    await lib.smelt(foodItem, 'coal', count);
    console.log('Smelt completed!');
  } catch (e) {
    console.log('Field smelt error:', e.message);
  }
}

// Eat any food in inventory
const edible = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'mutton', 'beef', 'porkchop', 'chicken'];
for (const f of edible) {
  while (lib.count(f) > 0 && bot.food < 20) {
    console.log(`Eating ${f}...`);
    try {
      await lib.eat();
      await sleep(500);
    } catch (e) {
      break;
    }
  }
}

// Return towards base if night in < 150s or we are done
if (checkTime() < 150 || bot.food >= 14) {
  console.log('Returning to base...');
  // Waypoints back to base
  const returnWaypoints = [
    new Vec3(298, 72, -120),
    new Vec3(298, 72, -80),
    new Vec3(294, 72, -54)
  ];
  for (const rwp of returnWaypoints) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(rwp.x, rwp.y, rwp.z, 2));
    } catch (err) {}
  }

  // Enter base door
  const doorPos = new Vec3(294, 72, -54);
  const door = bot.blockAt(doorPos);
  if (door && door.name.includes('door')) {
    await bot.activateBlock(door);
    await sleep(300);
    await lib.walkTo(294, -56);
    await sleep(300);
    await bot.activateBlock(bot.blockAt(doorPos));
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Food final:', bot.food, 'Health final:', bot.health);
