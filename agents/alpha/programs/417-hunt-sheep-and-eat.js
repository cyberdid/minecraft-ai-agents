// programs/417-hunt-sheep-and-eat.js
console.log('=== Program 417: Hunt Sheep/Chicken, Cook & Restore Health ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const t = lib.time();
console.log('Time until night:', t.secondsUntilNight, 's');

// 1. Exit base through door
console.log('Exiting base door (294, 72, -54)...');
try {
  await globalThis.passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Hunt sheep or chicken for meat
let huntedMeat = 0;
for (const mob of ['sheep', 'chicken', 'pig', 'cow']) {
  if (lib.time().secondsUntilNight < 120 || isCancelled()) break;
  try {
    console.log(`Searching for ${mob}...`);
    await lib.hunt(mob, 2);
    console.log(`Successfully hunted ${mob}!`);
    break;
  } catch (err) {
    console.log(`Hunt ${mob} note:`, err.message);
  }
}

// 3. Return to base
console.log('Returning to base shelter...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 25000 });
  await globalThis.passDoorIn();
  console.log('Safely back inside base!');
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Alpha at:', lib.fmt(bot.entity.position));
const rawMeat = ['mutton', 'chicken', 'porkchop', 'beef'].find(m => lib.count(m) > 0);
console.log('Raw meat available:', rawMeat, 'count:', rawMeat ? lib.count(rawMeat) : 0);

// 4. Smelt raw meat in base furnace (295, 72, -55)
if (rawMeat) {
  const cnt = lib.count(rawMeat);
  console.log(`Smelting ${cnt} ${rawMeat} in base furnace...`);
  try {
    const fBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (fBlock) {
      const f = await bot.openFurnace(fBlock);
      const coalItem = bot.inventory.items().find(i => i.name === 'coal');
      const meatItem = bot.inventory.items().find(i => i.name === rawMeat);
      if (coalItem) await f.putFuel(coalItem.type, null, 1);
      if (meatItem) await f.putInput(meatItem.type, null, cnt);
      for (let w = 0; w < cnt * 11; w++) {
        await sleep(1000);
        if (f.outputItem()) {
          console.log(`Taking cooked ${f.outputItem().name}x${f.outputItem().count}!`);
          await f.takeOutput();
        }
        if (lib.count(rawMeat) === 0 && !f.inputItem()) break;
      }
      f.close();
    }
  } catch (err) {
    console.log('Smelt error:', err.message);
  }
}

// 5. Eat cooked food
const cooked = ['cooked_mutton', 'cooked_chicken', 'cooked_porkchop', 'cooked_beef'].find(f => lib.count(f) > 0);
if (cooked) {
  while (lib.count(cooked) > 0 && bot.food < 20) {
    console.log(`Eating ${cooked}...`);
    await globalThis.safeEat(cooked);
    await sleep(200);
  }
}

console.log('Alpha final status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha food hunt complete! Health=${bot.health}/20, Food=${bot.food}/20.`);
