// programs/360-hunt-and-gather-food.js
console.log('=== Program 360: Hunt and Gather Food for Team ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
const time = lib.time();
console.log('Time until night:', time.secondsUntilNight, 's');

// 1. Pass through door outside base
try {
  console.log('Exiting base...');
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
  // Fallback: try lib.goThroughDoor
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// Helper to count total raw and cooked meat in inventory
function getMeatCount() {
  const meatNames = ['beef', 'mutton', 'porkchop', 'chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'];
  let total = 0;
  for (const item of bot.inventory.items()) {
    if (meatNames.includes(item.name)) total += item.count;
  }
  return total;
}

// 2. Scan and hunt animals
const targetTypes = new Set(['cow', 'sheep', 'pig', 'chicken']);

let huntedCount = 0;
const huntStart = Date.now();

while (Date.now() - huntStart < 90000 && getMeatCount() < 10) {
  if (isCancelled()) break;
  if (lib.time().secondsUntilNight < 120) {
    console.log('Night approaching (<120s), stopping hunt to return to base!');
    break;
  }

  // Find all animal entities within 60 blocks sorted by distance
  const animals = Object.values(bot.entities).filter(e => 
    e && targetTypes.has(e.name) && e.position && bot.entity.position.distanceTo(e.position) < 60
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (animals.length === 0) {
    console.log('No animals immediately visible within 60m. Exploring South towards grass...');
    // South has grass plains around z = -30 to 20
    const currentPos = bot.entity.position;
    const targetZ = currentPos.z + 25;
    try {
      await lib.goTo(currentPos.x, currentPos.y, targetZ, 3, { timeoutMs: 15000 });
    } catch (e) {
      console.log('Explore move note:', e.message);
      // Try slightly different direction
      try {
        await lib.goToXZ(currentPos.x + 15, currentPos.z + 15);
      } catch (e2) {}
    }
    continue;
  }

  const target = animals[0];
  console.log(`Targeting ${target.name} at ${lib.fmt(target.position)} (dist: ${bot.entity.position.distanceTo(target.position).toFixed(1)}m)`);

  try {
    // Equip iron sword
    const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
    if (sword) await bot.equip(sword, 'hand');

    // Move close to target
    await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { timeoutMs: 12000 });

    // Attack target
    for (let hit = 0; hit < 3; hit++) {
      if (!bot.entities[target.id]) break; // target dead
      await bot.lookAt(target.position.offset(0, target.height ? target.height * 0.5 : 0.5, 0), true);
      await bot.attack(target);
      await sleep(650);
    }

    // Pick up meat and drops
    await sleep(400);
    await lib.pickup(6);
    huntedCount++;
    console.log(`Hunted ${target.name}. Meat count: ${getMeatCount()}`);
  } catch (err) {
    console.log(`Failed to hunt ${target.name}:`, err.message);
  }
}

console.log(`Hunting finished. Total meat acquired: ${getMeatCount()}`);

// 3. Return to base
console.log('Returning to base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 25000 });
  await globalThis.passDoorIn();
  console.log('Back safely inside base!');
} catch (e) {
  console.log('Return to base error:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor fallback error:', e2.message);
  }
}

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inventory:', JSON.stringify(lib.inv()));
