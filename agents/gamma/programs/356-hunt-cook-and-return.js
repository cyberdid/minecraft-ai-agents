// programs/356-hunt-cook-and-return.js
console.log('=== HUNT, COOK AND RETURN TO BASE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// Step 1: Scan for nearby animals
const animalTypes = ['pig', 'cow', 'sheep', 'chicken'];
const targets = Object.values(bot.entities)
  .filter(e => e && animalTypes.includes(e.name) && e.position.distanceTo(bot.entity.position) < 48)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${targets.length} animals nearby`);
for (const t of targets.slice(0, 3)) {
  if (!t.isValid || isCancelled()) break;
  console.log(`Hunting ${t.name} at ${lib.fmt(t.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(t.position.x, t.position.y, t.position.z, 2));
    await lib.equipWeapon();
    const dline = Date.now() + 6000;
    while (t.isValid && Date.now() < dline) {
      bot.attack(t);
      await sleep(550);
    }
    await lib.pickup(6);
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// Step 2: Craft furnace if we don't have one
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  console.log('Crafting furnace...');
  try {
    await lib.craft('furnace', 1);
    console.log('Furnace crafted!');
  } catch (e) {
    console.log('Craft furnace note:', e.message);
  }
}

// Step 3: Smelt raw meats
const rawMeats = ['porkchop', 'beef', 'mutton', 'chicken'].filter(m => lib.count(m) > 0);
console.log('Raw meats:', rawMeats.map(m => `${m} x${lib.count(m)}`).join(', '));

if (rawMeats.length > 0) {
  for (const m of rawMeats) {
    const qty = lib.count(m);
    try {
      console.log(`Smelting ${qty}x ${m}...`);
      await lib.smelt(m, 'birch_planks', qty);
    } catch (e) {
      console.log(`Smelt ${m} note:`, e.message);
    }
  }

  // Feast!
  for (let i = 0; i < 5; i++) {
    if (bot.food >= 20) break;
    try { await lib.eat(); } catch (e) { break; }
  }
}

console.log('Food now:', bot.food, 'HP:', bot.health);

// Step 4: Pick up any placed furnace or crafting table
const nearbyFurnace = lib.find('furnace', { maxDistance: 6 })[0];
if (nearbyFurnace) {
  try {
    await lib.dig(nearbyFurnace.position.x, nearbyFurnace.position.y, nearbyFurnace.position.z);
    await lib.pickup(4);
  } catch (e) {}
}

// Step 5: March back to base
console.log('Marching back to base...');
const waypoints = [
  new Vec3(340, 71, 50),
  new Vec3(310, 70, 0),
  new Vec3(294, 72, -30),
  new Vec3(294, 72, -53)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 3, { timeoutMs: 18000 });
  } catch (e) {
    console.log(`Waypoint ${lib.fmt(wp)} note:`, e.message);
  }
}

// Enter base door
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 6000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Ending status:', JSON.stringify(lib.status()));
