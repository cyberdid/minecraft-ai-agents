// programs/047-target-cows-at-89.js
bot.chat('gamma running North to (317, 71, 89) for cows to feed Beta!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

// 2. Sprint North towards (317, 71, 85)
console.log('Sprint Stage 1: towards (305, 65, 30)...');
try {
  await lib.goTo(305, 65, 30, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

console.log('Sprint Stage 2: towards (317, 71, 85)...');
try {
  await lib.goTo(317, 71, 85, 3, { dig: true });
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

console.log('Arrived at cow pasture:', lib.fmt(bot.entity.position));

// 3. Hunt cows
const cows = Object.values(bot.entities)
  .filter(e => e.name === 'cow' && e.position && e.position.distanceTo(bot.entity.position) < 40)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${cows.length} cows`);
for (const cow of cows.slice(0, 3)) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  console.log(`Attacking cow at ${lib.fmt(cow.position)}...`);
  await lib.equipWeapon();
  try { await lib.goTo(cow.position.x, cow.position.y, cow.position.z, 2, { dig: true }); } catch (e) {}
  
  const cid = cow.id;
  const deadline = Date.now() + 8000;
  while (bot.entities[cid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(cow.position.offset(0, cow.height * 0.5, 0));
    bot.attack(cow);
    await sleep(550);
  }
  await sleep(300);
  await lib.pickup(6);
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 4. Cook beef on the spot
if (lib.count('beef') > 0 && lib.count('coal') > 0) {
  console.log(`Cooking ${lib.count('beef')} beef...`);
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);
  const beef = bot.inventory.items().find(i => i.name === 'beef');
  const coal = bot.inventory.items().find(i => i.name === 'coal');
  await f.putInput(beef.type, null, beef.count);
  await f.putFuel(coal.type, null, 1);

  const beefCount = beef.count;
  const deadline = Date.now() + (beefCount * 11000 + 4000);
  while (!isCancelled() && Date.now() < deadline && lib.time().secondsUntilNight > 140) {
    await sleep(1000);
    if (f.outputItem() && f.outputItem().count >= beefCount) break;
  }
  if (f.outputItem()) {
    console.log('Cooked output:', f.outputItem().name, 'x' + f.outputItem().count);
    await f.takeOutput();
  }
  if (f.inputItem()) await f.takeInput();
  if (f.fuelItem()) await f.takeFuel();
  f.close();
  await lib.dig(spot.x, spot.y, spot.z);
  await lib.pickup(4);
}

// 5. Return to base
console.log('Returning to base with food...');
try {
  await lib.goTo(305, 65, 30, 3, { dig: true });
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));

// 6. Deliver food to Beta
const beta = bot.players.beta?.entity;
if (beta && lib.count('cooked_beef') > 0) {
  console.log(`Tossing cooked_beef to Beta at ${lib.fmt(beta.position)}...`);
  await bot.lookAt(beta.position.offset(0, 1.6, 0));
  await bot.toss(mcData.itemsByName.cooked_beef.id, null, Math.min(lib.count('cooked_beef'), 4));
  bot.chat('beta: tossed you fresh cooked_beef! Eat up to 20/20 food!');
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma delivered food to base! Cooked beef remaining: ${lib.count('cooked_beef')}`);
