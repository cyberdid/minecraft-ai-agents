// programs/052-save-delta-and-hunt.js
bot.chat('delta: rotten flesh in chest prevents starvation damage! Gamma running North to hunt fresh beef with Alpha!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

// 2. Sprint North in stages
console.log('Sprint North Stage 1: towards (305, 65, 30)...');
try {
  await lib.goTo(305, 65, 30, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

console.log('Sprint North Stage 2: towards (315, 71, 75)...');
try {
  await lib.goTo(315, 71, 75, 3, { dig: true });
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

console.log('North pasture reached:', lib.fmt(bot.entity.position));

// Check if Alpha is here
const alpha = bot.players.alpha?.entity;
if (alpha) {
  console.log(`Alpha is at ${lib.fmt(alpha.position)}!`);
}

// 3. Hunt all cows/pigs/sheep within 50 blocks
const foodAnimals = Object.values(bot.entities)
  .filter(e => e.name && ['cow', 'pig', 'sheep'].includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 50)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${foodAnimals.length} food animals:`, foodAnimals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

for (const a of foodAnimals.slice(0, 4)) {
  if (isCancelled() || lib.time().secondsUntilNight < 160) break;
  console.log(`Attacking ${a.name} at ${lib.fmt(a.position)}...`);
  await lib.equipWeapon();
  try { await lib.goTo(a.position.x, a.position.y, a.position.z, 2, { dig: true }); } catch (e) {}
  
  const aid = a.id;
  const deadline = Date.now() + 8000;
  while (bot.entities[aid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(a.position.offset(0, a.height * 0.5, 0));
    bot.attack(a);
    await sleep(550);
  }
  await sleep(300);
  await lib.pickup(6);
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 4. Cook raw meat with portable furnace
const rawMeats = ['beef', 'mutton', 'porkchop'];
const rawName = rawMeats.find(n => lib.count(n) > 0);
if (rawName && lib.count('coal') > 0) {
  console.log(`Cooking ${lib.count(rawName)} ${rawName}...`);
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);
  const raw = bot.inventory.items().find(i => i.name === rawName);
  const coal = bot.inventory.items().find(i => i.name === 'coal');
  await f.putInput(raw.type, null, raw.count);
  await f.putFuel(coal.type, null, 1);

  const rawCount = raw.count;
  const deadline = Date.now() + (rawCount * 11000 + 4000);
  while (!isCancelled() && Date.now() < deadline && lib.time().secondsUntilNight > 120) {
    await sleep(1000);
    if (f.outputItem() && f.outputItem().count >= rawCount) break;
  }
  if (f.outputItem()) {
    console.log(`Cooked output: ${f.outputItem().name} x${f.outputItem().count}`);
    await f.takeOutput();
  }
  if (f.inputItem()) await f.takeInput();
  if (f.fuelItem()) await f.takeFuel();
  f.close();
  await lib.dig(spot.x, spot.y, spot.z);
  await lib.pickup(4);
}

// 5. Return to base before nightfall
console.log('Returning to base with food...');
try {
  await lib.goTo(305, 65, 30, 3, { dig: true });
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));

// 6. Deliver food to Delta / Beta
const cookedMeatName = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop'].find(n => lib.count(n) > 0);
if (cookedMeatName && lib.count(cookedMeatName) > 0) {
  const delta = bot.players.delta?.entity;
  if (delta) {
    console.log(`Tossing ${cookedMeatName} to Delta at ${lib.fmt(delta.position)}...`);
    await bot.lookAt(delta.position.offset(0, 1.6, 0));
    await bot.toss(mcData.itemsByName[cookedMeatName].id, null, Math.min(lib.count(cookedMeatName), 3));
    bot.chat(`delta: tossed you ${cookedMeatName}! Eat up to 20/20 food!`);
  }
}

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
