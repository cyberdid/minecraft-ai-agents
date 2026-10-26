// programs/085-food-expedition-hunt.js
console.log('--- FOOD RELIEF EXPEDITION: HUNTING PHASE ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Step outside base
console.log('Exiting base door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);

// 2. Gather 6 logs for tools and furnace fuel
console.log('Collecting 6 logs...');
const logs = await lib.collect('*_log', 6);
console.log('Logs collected:', JSON.stringify(logs));

// Craft planks & sticks
const logType = Object.keys(logs)[0] || 'birch_log';
const plankType = logType.replace('_log', '_planks');
await lib.craft(plankType, 16);
await lib.craft('stick', 8);

// Wooden pickaxe -> 10 stone -> stone sword & pickaxe
console.log('Crafting wooden_pickaxe & mining 10 stone...');
await lib.craft('wooden_pickaxe', 1);
await lib.collect('stone', 10);
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Equipped stone_sword. Starting mass hunt for cattle/sheep...');
bot.chat('Gamma is hunting beef and provisions in Overworld to deliver food to Alpha & Beta at Fortress!');

const meatTypes = ['beef', 'porkchop', 'mutton', 'chicken'];
function totalMeat() {
  let count = 0;
  for (const m of meatTypes) count += lib.count(m);
  return count;
}

const animals = ['cow', 'pig', 'sheep', 'chicken'];
const huntStart = Date.now();

// Hunt for up to 60s or until 10+ raw meat
while (totalMeat() < 10 && (Date.now() - huntStart < 60000) && !isCancelled()) {
  const target = bot.nearestEntity(e => 
    animals.includes(e.name) && 
    e.position && 
    e.position.distanceTo(bot.entity.position) < 80
  );

  if (!target) {
    console.log('No animals within 80m. Exploring toward pasture (310, 70, 30)...');
    try {
      await lib.goToXZ(310, 30, { timeoutMs: 15000 });
    } catch (e) {
      console.log('Pasture move note:', e.message);
      break;
    }
    continue;
  }

  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    while (target.isValid && target.position.distanceTo(bot.entity.position) > 3) {
      if (isCancelled()) break;
      await bot.pathfinder.goto(new goals.GoalFollow(target, 2));
    }
    while (target.isValid && !isCancelled()) {
      await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
      bot.attack(target);
      await sleep(650);
    }
    await sleep(300);
    await lib.pickup(6);
    console.log(`Meat count: ${totalMeat()}`);
  } catch (err) {
    console.log('Hunt target err:', err.message);
    await sleep(400);
  }
}

// Return to base door
console.log('Returning to base shelter door...');
try {
  await lib.goTo(294, 72, -53, 1);
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return door note:', e.message);
}

console.log('Inside base shelter. Total raw meat:', totalMeat());
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma hunted provisions: raw meat=${totalMeat()}. Ready to cook in furnace.`);
