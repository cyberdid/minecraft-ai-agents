// programs/031-emergency-food-for-beta.js
bot.chat('alpha beta: on it! Hunting cow North, cooking beef, bringing straight to Beta!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: false });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

// 2. Sprint North to cow grounds around (303, 64, 26)
console.log('Heading North to hunt cow at (303, 64, 26)...');
try {
  await lib.goTo(303, 64, 24, 2, { dig: true });
} catch (e) {
  console.log('GoTo cow error:', e.message);
}

// 3. Find and kill animal
const animal = bot.nearestEntity(e => ['cow', 'sheep', 'pig'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 24);
if (animal) {
  console.log(`Hunting ${animal.name} at ${lib.fmt(animal.position)}...`);
  await lib.equipWeapon();
  const aid = animal.id;
  const deadline = Date.now() + 10000;
  while (bot.entities[aid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(animal.position.offset(0, animal.height * 0.5, 0));
    bot.attack(animal);
    await sleep(550);
  }
  await sleep(400);
  await lib.pickup(8);
} else {
  console.log('No animal immediately at (303, 64, 24), scanning wider...');
  const anyAnimal = bot.nearestEntity(e => ['cow', 'sheep', 'pig', 'chicken'].includes(e.name));
  if (anyAnimal) {
    console.log(`Found ${anyAnimal.name} at ${lib.fmt(anyAnimal.position)}`);
    await lib.goTo(anyAnimal.position.x, anyAnimal.position.y, anyAnimal.position.z, 2, { dig: true });
    await lib.equipWeapon();
    const aid = anyAnimal.id;
    const deadline = Date.now() + 10000;
    while (bot.entities[aid] && Date.now() < deadline && !isCancelled()) {
      await bot.lookAt(anyAnimal.position.offset(0, anyAnimal.height * 0.5, 0));
      bot.attack(anyAnimal);
      await sleep(550);
    }
    await sleep(400);
    await lib.pickup(8);
  }
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 4. Cook raw meat
const rawMeatName = ['beef', 'mutton', 'porkchop', 'chicken'].find(n => lib.count(n) > 0);
if (rawMeatName) {
  console.log(`Cooking ${rawMeatName}...`);
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);
  const rawItem = bot.inventory.items().find(i => i.name === rawMeatName);
  await f.putInput(rawItem.type, null, rawItem.count);
  const coalItem = bot.inventory.items().find(i => i.name === 'coal');
  await f.putFuel(coalItem.type, null, 1);
  
  // Wait for cooked meat
  const deadline = Date.now() + 20000;
  while (!isCancelled() && Date.now() < deadline) {
    await sleep(1000);
    if (f.outputItem() && f.outputItem().count >= 1) break;
  }
  if (f.outputItem()) {
    console.log('Smelted output:', f.outputItem().name, 'x' + f.outputItem().count);
    await f.takeOutput();
  }
  f.close();
  await lib.dig(spot.x, spot.y, spot.z);
  await lib.pickup(4);
}

console.log('Cooked food ready! Inventory:', JSON.stringify(lib.inv()));

// 5. Head back to main shaft opening at (302, 70, -42)
console.log('Heading to shaft opening at (302, 70, -42)...');
try {
  await lib.goTo(302, 70, -42, 1, { dig: true });
} catch (e) {
  console.log('Shaft opening goTo error:', e.message);
}

console.log('At shaft entrance:', lib.fmt(bot.entity.position));
bot.chat(`gamma has cooked food ready! Entering shaft to deliver to Beta!`);
