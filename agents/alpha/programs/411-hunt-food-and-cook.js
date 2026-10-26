// programs/411-hunt-food-and-cook.js
console.log('=== Program 411: Hunt Food, Mine Coal & Cook in Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Step outside base door (294, 72, -54)
console.log('Stepping outside base...');
try {
  await globalThis.passDoorOut();
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Mine 2-3 coal ore on the way south if accessible
console.log('Scanning for coal ore near path...');
const coalBlocks = bot.findBlocks({
  matching: b => b.name === 'coal_ore',
  maxDistance: 16,
  count: 3
});
if (coalBlocks.length > 0) {
  console.log(`Found ${coalBlocks.length} coal block(s). Mining...`);
  for (const cPos of coalBlocks) {
    try {
      await lib.dig(cPos.x, cPos.y, cPos.z);
    } catch (e) {}
  }
  await lib.pickup(6);
  console.log('Coal in inventory:', lib.count('coal'));
}

// 3. Move South towards grass plains (z = -25) to hunt animals
console.log('Exploring South for pasture animals...');
try {
  await lib.goTo(294, 72, -25, 2, { timeoutMs: 15000 });
} catch (e) {
  console.log('Move south note:', e.message);
}

// Hunt animals
const targetTypes = ['sheep', 'cow', 'pig', 'chicken'];
let hunted = 0;
const huntDeadline = Date.now() + 40000;

while (Date.now() < huntDeadline && hunted < 4 && !isCancelled()) {
  const animal = Object.values(bot.entities).find(e => 
    e && targetTypes.includes(e.name) &&
    e.position && bot.entity.position.distanceTo(e.position) < 45
  );

  if (!animal) {
    console.log('No animals in immediate view, advancing slightly...');
    try {
      await lib.goToXZ(bot.entity.position.x + 10, bot.entity.position.z + 15);
    } catch (e) { break; }
    continue;
  }

  console.log(`Found ${animal.name} at ${lib.fmt(animal.position)} (dist: ${bot.entity.position.distanceTo(animal.position).toFixed(1)}m)`);
  try {
    await lib.equipWeapon();
    await lib.goTo(animal.position.x, animal.position.y, animal.position.z, 2, { timeoutMs: 8000 });
    for (let hit = 0; hit < 4; hit++) {
      if (!bot.entities[animal.id]) break;
      await bot.lookAt(animal.position.offset(0, 0.5, 0), true);
      await bot.attack(animal);
      await sleep(650);
    }
    await sleep(300);
    await lib.pickup(6);
    hunted++;
    console.log(`Hunted ${animal.name}! Inventory now:`, JSON.stringify(lib.inv()));
  } catch (err) {
    console.log('Hunt attempt note:', err.message);
  }
}

// 4. Return to base
console.log('Returning to base shelter (294, 72, -54)...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 25000 });
  await globalThis.passDoorIn();
  console.log('Safely inside base!');
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('Return error:', e2.message);
  }
}

console.log('Alpha at:', lib.fmt(bot.entity.position));
console.log('Raw meat in inventory:', {
  beef: lib.count('beef'),
  mutton: lib.count('mutton'),
  porkchop: lib.count('porkchop'),
  chicken: lib.count('chicken')
});

// 5. Smelt raw meat in base furnace (295, 72, -55)
const furnacePos = new Vec3(295, 72, -55);
const fBlock = bot.blockAt(furnacePos);
const rawMeat = ['mutton', 'beef', 'porkchop', 'chicken'].find(m => lib.count(m) > 0);
const fuel = lib.count('coal') > 0 ? 'coal' : (lib.count('oak_planks') > 0 ? 'oak_planks' : 'stick');

if (fBlock && rawMeat) {
  const meatCount = lib.count(rawMeat);
  console.log(`Smelting ${meatCount} ${rawMeat} with ${fuel}...`);
  try {
    const f = await bot.openFurnace(fBlock);
    const fuelItem = bot.inventory.items().find(i => i.name === fuel);
    const meatItem = bot.inventory.items().find(i => i.name === rawMeat);
    if (fuelItem) await f.putFuel(fuelItem.type, null, Math.min(meatCount, fuelItem.count));
    if (meatItem) await f.putInput(meatItem.type, null, meatItem.count);
    
    // Wait for smelt
    for (let wait = 0; wait < 25; wait++) {
      await sleep(1000);
      if (f.outputItem()) {
        console.log(`Taking ${f.outputItem().name}x${f.outputItem().count} from furnace!`);
        await f.takeOutput();
        break;
      }
    }
    f.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

// 6. Eat cooked food to restore hunger
const cookedFood = ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken'].find(f => lib.count(f) > 0);
if (cookedFood && bot.food < 20) {
  console.log(`Eating ${cookedFood} to restore food...`);
  await globalThis.safeEat(cookedFood);
  console.log('Food now:', bot.food, 'Health:', bot.health);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
