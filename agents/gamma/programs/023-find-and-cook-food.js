// programs/023-find-and-cook-food.js
bot.chat('beta hold on! gamma getting food for you right now!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// Scan all entities for food animals
const foodMobs = ['cow', 'pig', 'sheep', 'chicken'];
const animals = Object.values(bot.entities)
  .filter(e => e.name && foodMobs.includes(e.name) && e.position)
  .map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position) }))
  .sort((a, b) => a.dist - b.dist);

console.log('Food animals found:', JSON.stringify(animals));

if (animals.length === 0) {
  console.log('No animals found in loaded entities, exploring South towards z=10...');
  await lib.explore(0, 1, 15, () => {
    return Object.values(bot.entities).find(e => e.name && foodMobs.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 40);
  });
}

// Hunt the nearest animal
const target = Object.values(bot.entities)
  .filter(e => e.name && foodMobs.includes(e.name) && e.position)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))[0];

if (target) {
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}`);
  await lib.equipWeapon();
  try {
    await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { dig: true });
  } catch (e) {}

  const tid = target.id;
  const deadline = Date.now() + 10000;
  while (bot.entities[tid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(550);
  }
  await sleep(400);
  await lib.pickup(8);
  console.log('Gained raw food! Inventory:', JSON.stringify(lib.inv()));

  // Cook raw food with portable furnace
  const rawItems = ['beef', 'porkchop', 'mutton', 'chicken'];
  const raw = rawItems.find(name => lib.count(name) > 0);
  if (raw) {
    console.log(`Cooking ${raw}...`);
    // Place furnace on free spot
    const spot = await lib.freeSpot();
    await lib.place('furnace', spot.x, spot.y, spot.z);
    const furnaceBl = bot.blockAt(spot);
    const f = await bot.openFurnace(furnaceBl);
    const rItem = bot.inventory.items().find(i => i.name === raw);
    await f.putInput(rItem.type, null, rItem.count);
    const pItem = bot.inventory.items().find(i => i.name.includes('planks'));
    await f.putFuel(pItem.type, null, 1);
    
    // Wait for at least 1 cooked item
    const cookDead = Date.now() + 15000;
    while (!f.outputItem() && Date.now() < cookDead && !isCancelled()) {
      await sleep(1000);
    }
    if (f.outputItem()) {
      console.log('Cooked output:', f.outputItem().name, 'x' + f.outputItem().count);
      await f.takeOutput();
    }
    f.close();
    // Mine furnace back
    await lib.dig(spot.x, spot.y, spot.z);
    await lib.pickup(4);
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma has food ready: ${JSON.stringify(lib.inv())}. Heading to Beta!`);
