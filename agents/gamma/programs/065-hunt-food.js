// programs/065-hunt-food.js
console.log('--- HUNTING FOR FOOD ---');
console.log('Stepping outside base...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside at:', lib.fmt(bot.entity.position));

await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

const meatNames = ['beef', 'porkchop', 'mutton', 'chicken'];
function getMeatCount() {
  let count = 0;
  for (const m of meatNames) count += lib.count(m);
  return count;
}

const targetMobs = ['cow', 'pig', 'sheep', 'chicken'];
const startTime = Date.now();

// Hunt until we have at least 8 meat or 60s passed
while (getMeatCount() < 8 && (Date.now() - startTime) < 60000 && !isCancelled()) {
  const entity = bot.nearestEntity(e => 
    targetMobs.includes(e.name) && 
    e.position && 
    e.position.distanceTo(bot.entity.position) < 64
  );

  if (!entity) {
    console.log('No animals within 64m. Exploring North towards pasture (310, 70, 30)...');
    try {
      await lib.goTo(310, 70, 30, 3);
    } catch (e) {
      console.log('Explore note:', e.message);
    }
    // Check again
    const nextEntity = bot.nearestEntity(e => targetMobs.includes(e.name));
    if (!nextEntity) {
      console.log('Still no animals found nearby.');
      break;
    }
    continue;
  }

  console.log(`Hunting ${entity.name} at ${lib.fmt(entity.position)}...`);
  try {
    // Approach and attack
    while (entity.isValid && entity.position.distanceTo(bot.entity.position) > 3) {
      if (isCancelled()) break;
      await bot.pathfinder.goto(new goals.GoalFollow(entity, 2.5));
    }
    
    while (entity.isValid && !isCancelled()) {
      await bot.lookAt(entity.position.offset(0, entity.height * 0.5, 0));
      bot.attack(entity);
      await sleep(650);
    }
    
    // Pick up meat drops
    await sleep(400);
    await lib.pickup(8);
    console.log(`Current raw meat: ${getMeatCount()} items:`, JSON.stringify(lib.inv()));
  } catch (err) {
    console.log(`Hunt err: ${err.message}`);
    await sleep(500);
  }
}

console.log('Returning to base door...');
await lib.goTo(294, 72, -53, 1);
await lib.goThroughDoor(294, 72, -54);
console.log('Safely inside base. Total meat:', getMeatCount());
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma hunted food: raw meat=${getMeatCount()}, back at base`);
