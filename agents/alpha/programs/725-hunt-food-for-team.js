// programs/725-hunt-food-for-team.js
console.log('=== Program 725: Hunt Food & Feed Delta ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Scan for animals within 45m of base
const animalNames = ['cow', 'pig', 'sheep', 'chicken'];
const animals = Object.values(bot.entities)
  .filter(e => e.isValid && animalNames.includes(e.name) && bot.entity.position.distanceTo(e.position) <= 45)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${animals.length} animals within 45m:`);
for (const a of animals) {
  console.log(` - ${a.name} at ${lib.fmt(a.position)} (${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// 2. If animals found, hunt up to 3 animals
let hunted = 0;
for (const a of animals) {
  if (checkCancelled() || hunted >= 3) break;
  if (!a.isValid) continue;

  console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
  try {
    const sw = bot.inventory.items().find(i => i.name.includes('_sword'));
    if (sw) await bot.equip(sw, 'hand');
    
    // Move close to animal
    await bot.pathfinder.goto(new goals.GoalNear(a.position.x, a.position.y, a.position.z, 2.0));
    await bot.lookAt(a.position.offset(0, 0.5, 0), true);
    bot.attack(a);
    await sleep(650);
    if (a.isValid) {
      bot.attack(a);
      await sleep(650);
    }
    hunted++;
    await sleep(400);
    await lib.pickup(4.0);
  } catch (err) {
    console.log(`Hunt note for ${a.name}:`, err.message);
  }
}

// 3. Return to base door (294, 72, -54) and enter
console.log('Returning to base...');
try {
  await lib.goToXZ(294, -53, { timeoutMs: 10000 });
} catch (e) {}

try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    const door = bot.blockAt(new Vec3(294, 72, -54));
    if (door) await bot.activateBlock(door);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Put raw meat in furnace (295, 72, -54) with wood/coal fuel
const rawMeats = ['beef', 'raw_beef', 'mutton', 'raw_mutton', 'porkchop', 'raw_porkchop', 'chicken', 'raw_chicken'];
for (const rm of rawMeats) {
  const item = bot.inventory.items().find(i => i.name === rm);
  if (item) {
    console.log(`Found raw meat ${item.name} x${item.count}! Smelting in furnace...`);
    try {
      const fb = bot.blockAt(new Vec3(295, 72, -54));
      if (fb) {
        const furnace = await bot.openFurnace(fb);
        const fuel = bot.inventory.items().find(i => i.name === 'oak_planks' || i.name === 'coal' || i.name === 'charcoal');
        if (fuel && !furnace.fuelItem()) {
          await furnace.putFuel(fuel.type, null, Math.min(fuel.count, 4));
        }
        await furnace.putInput(item.type, null, item.count);
        console.log(`Put ${item.name} x${item.count} into furnace!`);
        furnace.close();
      }
    } catch (e) {
      console.log('Furnace cooking error:', e.message);
    }
  }
}

// 5. If Delta is nearby and we have edible food, toss to Delta
const delta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'delta');
if (delta) {
  for (const fn of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'beef', 'mutton']) {
    const foodItem = bot.inventory.items().find(i => i.name === fn);
    if (foodItem) {
      await bot.lookAt(delta.position.offset(0, 1.2, 0), true);
      await bot.toss(foodItem.type, null, foodItem.count);
      bot.chat(`alpha: Tossed ${foodItem.name} x${foodItem.count} to Delta! Eat up!`);
      break;
    }
  }
}

// 6. Check if time to sleep
if (lib.time().canSleep) {
  console.log('Night! Sleeping in base bed to restore HP & Food for everyone...');
  try {
    await lib.sleepInBed();
    bot.chat('alpha: Slept at base bed! Full reset to 20/20 HP and Food!');
  } catch (e) {}
}

bot.chat(`alpha: Base status: HP ${bot.health}/20, Food ${bot.food}/20. Time: night in ${lib.time().nightIn}s`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  hunted,
  inv: lib.inv()
};
