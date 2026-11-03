// programs/434-finish-sprint-to-base.js
console.log('=== CAREFUL SPRINT TO BASE & RESTORE SPAWN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Strict movements: NO fall damage
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
moves.maxDropDown = 2; // zero fall damage!
bot.pathfinder.setMovements(moves);

console.log('Sprinting remaining 150m to base (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 60000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2));
  } catch (e2) {}
}

console.log('At base area! Pos:', lib.fmt(bot.entity.position));

// Enter base through door (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Lock spawn bed permanently
const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bed) {
  try {
    await lib.setSpawn();
    console.log('SUCCESS: Bed spawn confirmed at', lib.fmt(bed.position));
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }
}

// Check base chest for food
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const foodItem = chest.items().find(i => i.name.includes('cooked') || i.name.includes('bread') || i.name.includes('beef') || i.name.includes('porkchop') || i.name.includes('apple'));
    if (foodItem) {
      await chest.withdraw(foodItem.type, null, foodItem.count);
      console.log(`Withdrew ${foodItem.name} x${foodItem.count} from chest!`);
    }
    chest.close();
  } catch (e) {}
}

if (bot.food < 20) {
  try { await lib.eat(); } catch (e) {}
}

// Sleep loop until dawn if night approaching
const deadline = Date.now() + 90000;
while (Date.now() < deadline && !isCancelled()) {
  const t = bot.time.timeOfDay;
  if (t < 1000 || t > 23500) {
    console.log('Dawn reached! Time:', t);
    break;
  }
  const canSleep = t >= 12542 && t <= 23460;
  if (canSleep && bed) {
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bed);
      console.log('Sleeping!');
      await sleep(5000);
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(1000);
}

console.log('Dawn reached! Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
return { pos: bot.entity.position, hp: bot.health, food: bot.food, dim: bot.game.dimension };
