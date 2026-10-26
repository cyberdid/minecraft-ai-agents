// programs/412-hunt-northwest-pasture.js
console.log('=== Program 412: Hunt Northwest Pasture & Cook Steak ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const tStart = lib.time();
console.log(`Time: ${tStart.timeOfDay}, seconds until night: ${tStart.secondsUntilNight}`);

// 1. Exit base
console.log('Stepping outside...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Sprint toward Northwest pasture (282, 69, -85)
console.log('Running towards Northwest pasture at (282, 69, -85)...');
try {
  await lib.goTo(282, 69, -85, 3, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo pasture note:', e.message);
}

console.log('Reached pasture area at:', lib.fmt(bot.entity.position));

// 3. Scan for animals within 45 blocks
const targets = ['cow', 'sheep', 'pig', 'chicken'];
let hunted = 0;
const huntDeadline = Date.now() + 30000;

while (Date.now() < huntDeadline && hunted < 3 && !isCancelled()) {
  const currentT = lib.time();
  if (currentT.secondsUntilNight < 90) {
    console.log('Night approaching (<90s), stopping hunt!');
    break;
  }

  const animal = Object.values(bot.entities).find(e => 
    e && targets.includes(e.name) && e.position && bot.entity.position.distanceTo(e.position) < 45
  );

  if (!animal) {
    console.log('No animal nearby, scanning slightly further North...');
    try {
      await lib.goToXZ(bot.entity.position.x - 10, bot.entity.position.z - 15);
    } catch (e) { break; }
    continue;
  }

  console.log(`Targeting ${animal.name} at ${lib.fmt(animal.position)} (dist: ${bot.entity.position.distanceTo(animal.position).toFixed(1)}m)`);
  try {
    await lib.equipWeapon();
    await lib.goTo(animal.position.x, animal.position.y, animal.position.z, 2, { timeoutMs: 8000 });
    for (let hit = 0; hit < 4; hit++) {
      if (!bot.entities[animal.id]) break;
      await bot.lookAt(animal.position.offset(0, 0.5, 0), true);
      await bot.attack(animal);
      await sleep(650);
    }
    await sleep(250);
    await lib.pickup(6);
    hunted++;
    console.log(`Hunted ${animal.name}!`);
  } catch (err) {
    console.log('Hunt err:', err.message);
  }
}

// 4. Return to base
console.log('Returning to base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 20000 });
  await globalThis.passDoorIn();
  console.log('Inside base!');
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Alpha at:', lib.fmt(bot.entity.position));
const meats = ['beef', 'mutton', 'porkchop', 'chicken'].filter(m => lib.count(m) > 0);
console.log('Acquired raw meats:', meats.map(m => `${m}x${lib.count(m)}`).join(', '));

// 5. Cook in furnace (295, 72, -55) using coal
if (meats.length > 0) {
  const fPos = new Vec3(295, 72, -55);
  const fBlock = bot.blockAt(fPos);
  if (fBlock) {
    for (const m of meats) {
      const count = lib.count(m);
      console.log(`Smelting ${m}x${count}...`);
      try {
        const f = await bot.openFurnace(fBlock);
        const fuelItem = bot.inventory.items().find(i => i.name === 'coal');
        const meatItem = bot.inventory.items().find(i => i.name === m);
        if (fuelItem) await f.putFuel(fuelItem.type, null, 1);
        if (meatItem) await f.putInput(meatItem.type, null, count);
        
        for (let w = 0; w < count * 11; w++) {
          await sleep(1000);
          if (f.outputItem()) {
            console.log(`Cooked ${f.outputItem().name}x${f.outputItem().count}! Taking output...`);
            await f.takeOutput();
          }
          if (lib.count(m) === 0 && !f.inputItem()) break;
        }
        f.close();
      } catch (err) {
        console.log('Furnace err:', err.message);
      }
    }
  }
}

// 6. Eat cooked food
const cookedFoods = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'].filter(f => lib.count(f) > 0);
for (const cf of cookedFoods) {
  while (lib.count(cf) > 0 && bot.food < 20) {
    console.log(`Eating ${cf}...`);
    await globalThis.safeEat(cf);
    await sleep(200);
  }
}

console.log('Final Alpha status:', JSON.stringify(lib.status()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
