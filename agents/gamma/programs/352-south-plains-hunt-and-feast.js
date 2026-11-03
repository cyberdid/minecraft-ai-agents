// programs/352-south-plains-hunt-and-feast.js
console.log('=== HUNT SOUTH PLAINS FOR URGENT FOOD ===');
console.log('Current food:', bot.food, 'HP:', bot.health, 'Pos:', lib.fmt(bot.entity.position));

// Step 1: Exit base door
try {
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 4000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Step 2: Equip weapon
await lib.equipWeapon();

// Step 3: Search waypoints in South Grasslands
const searchWaypoints = [
  new Vec3(294, 72, -35),
  new Vec3(294, 72, -15),
  new Vec3(280, 71, 0),
  new Vec3(305, 71, 0),
  new Vec3(295, 71, 20)
];

const animalTypes = ['sheep', 'cow', 'pig', 'chicken'];
let totalKilled = 0;

for (const wp of searchWaypoints) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  if (bot.food < 6 && (lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken')) >= 2) {
    break; // Cook urgently
  }

  console.log(`Advancing to waypoint ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 3, { timeoutMs: 15000 });
  } catch (e) {
    console.log(`Waypoint ${lib.fmt(wp)} navigation note:`, e.message);
  }

  // Scan for nearby animals
  const targets = Object.values(bot.entities)
    .filter(e => e && animalTypes.includes(e.name) && e.position.distanceTo(bot.entity.position) < 32)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  console.log(`At ${lib.fmt(bot.entity.position)}, found ${targets.length} animals`);
  for (const target of targets) {
    if (!target.isValid) continue;
    console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
      await lib.equipWeapon();
      while (target.isValid && target.position.distanceTo(bot.entity.position) < 3.5) {
        bot.attack(target);
        await sleep(650);
      }
      await lib.pickup(6);
      totalKilled++;
    } catch (err) {
      console.log(`Error attacking ${target.name}:`, err.message);
    }
    if ((lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken')) >= 6) break;
  }

  if ((lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken')) >= 6) {
    console.log('Gathered ample raw meat!');
    break;
  }
}

console.log('--- Step 4: Cook meat and Eat ---');
const rawItems = ['mutton', 'beef', 'porkchop', 'chicken'].filter(item => lib.count(item) > 0);
console.log('Raw meat collected:', rawItems.map(item => `${item} x${lib.count(item)}`).join(', '));

if (rawItems.length > 0) {
  // Cook using lib.smelt
  for (const raw of rawItems) {
    const qty = lib.count(raw);
    console.log(`Cooking ${qty}x ${raw}...`);
    try {
      await lib.smelt(raw, 'birch_planks', qty);
    } catch (e) {
      console.log(`Smelt error for ${raw}:`, e.message);
    }
  }

  // Eat cooked food
  for (let i = 0; i < 4; i++) {
    try {
      await lib.eat();
    } catch (e) {
      break;
    }
  }
}

// Step 5: Head back to base
console.log('--- Step 5: Return to base ---');
try {
  await lib.goTo(294, 72, -53, 2, { timeoutMs: 25000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Base return note:', e.message);
}

console.log('Ending status:', JSON.stringify(lib.status()));
