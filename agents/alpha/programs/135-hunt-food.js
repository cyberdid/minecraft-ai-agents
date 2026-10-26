// programs/135-hunt-food.js
console.log('--- Hunting Food ---');
console.log('Status: Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// Look for nearby animals
const animals = ['cow', 'pig', 'sheep', 'chicken'];
const found = {};
for (const [id, e] of Object.entries(bot.entities)) {
  if (e && animals.includes(e.name) && e.position) {
    const dist = e.position.distanceTo(bot.entity.position);
    found[e.name] = (found[e.name] || 0) + 1;
    console.log(`Found ${e.name} at ${lib.fmt(e.position)} (dist: ${dist.toFixed(1)})`);
  }
}
console.log('Animals summary:', JSON.stringify(found));

// Step out through door
console.log('Going outside through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor error:', e.message);
  // fallback: open door, walk through, close
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294, -52);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('Manual door error:', e2.message);
  }
}

// Hunt whatever animal was found or try cow/sheep/pig
const huntTargets = ['cow', 'sheep', 'pig', 'chicken'];
let meatGained = 0;

for (const target of huntTargets) {
  if (lib.time().secondsUntilNight < 120) {
    console.log('Night approaching soon! Returning to base...');
    break;
  }
  try {
    console.log(`Hunting ${target}...`);
    const r = await lib.hunt(target, 2);
    console.log(`Hunt ${target} result:`, JSON.stringify(r));
    meatGained += (lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken'));
    if (meatGained >= 4) break;
  } catch (e) {
    console.log(`Hunt ${target} failed:`, e.message);
  }
}

// Return to base
console.log('Returning to base at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor into base error:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(293, -56);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base! Inventory:', JSON.stringify(lib.inv()));

// Smelt meat if we have any
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'];
for (const m of rawMeats) {
  const c = lib.count(m);
  if (c > 0) {
    console.log(`Smelting ${c} of ${m}...`);
    try {
      // Check if we have fuel
      if (lib.count('oak_planks') < 2) {
        // use stick or planks
      }
      const fuel = lib.count('oak_planks') > 0 ? 'oak_planks' : (lib.count('stick') > 0 ? 'stick' : null);
      if (fuel) {
        await lib.smelt(m, fuel, c);
      }
    } catch (e) {
      console.log(`Smelt ${m} error:`, e.message);
    }
  }
}

// Eat food
console.log('Eating...');
for (let i = 0; i < 5; i++) {
  if (bot.food >= 19) break;
  try {
    await lib.eat();
    console.log('Ate! Food now:', bot.food, 'Health:', bot.health);
  } catch (e) {
    console.log('Eat stopped:', e.message);
    break;
  }
}

console.log('Final status: Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay);
