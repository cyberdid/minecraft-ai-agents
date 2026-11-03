console.log('=== Program 943: Enter Base Before Night & Craft Eyes ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Start pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.time);

const doorFront = new Vec3(294, 72, -52);
const doorPos = new Vec3(294, 72, -54);
const insidePos = new Vec3(293, 72, -56);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log('Sprinting 47 blocks to Base Door...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(doorFront.x, doorFront.y, doorFront.z, 1.5));
} catch (e) {
  console.log('Pathfind error, falling back to goToXZ:', e.message);
  try {
    await lib.goToXZ(doorFront.x, doorFront.z, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('Near door! Pos:', lib.fmt(bot.entity.position));

// Pass through door
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Went through door!');
} catch (e) {
  console.log('Door notice:', e.message);
}

// Move inside
try {
  await bot.pathfinder.goto(new goals.GoalNear(insidePos.x, insidePos.y, insidePos.z, 0.8));
} catch (e) {}

console.log('Safe inside house! Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.time);
bot.chat('Beta: Safe inside Overworld Base House! Accessing Base Chest...');

// Check if night (time >= 12542 && time <= 23460) to sleep
if (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460) {
  console.log('Night time! Finding bed to sleep...');
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
  if (bed) {
    try {
      console.log('Sleeping in bed at', lib.fmt(bed.position));
      await bot.sleep(bed);
      await sleep(4000);
    } catch (se) {
      console.log('Sleep notice:', se.message);
    }
  }
}

// Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  console.log('Opening Base Chest at (293, 72, -57)...');
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(it => `${it.name}x${it.count}`).join(', '));

    const powder = items.find(it => it.name === 'blaze_powder');
    if (powder) {
      console.log(`Withdrawing ${powder.count} blaze_powder...`);
      await chest.withdraw(powder.type, null, powder.count);
    }

    const food = items.find(it => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(it.name));
    if (food) {
      console.log(`Withdrawing ${food.count} ${food.name}...`);
      await chest.withdraw(food.type, null, Math.min(16, food.count));
    }

    chest.close();
  } catch (err) {
    console.log('Chest interaction error:', err.message);
  }
}

// Craft Eyes of Ender
const powderHeld = lib.count('blaze_powder');
const pearlsHeld = lib.count('ender_pearl');
console.log(`Resources in inventory: ${powderHeld} blaze_powder, ${pearlsHeld} ender_pearl`);

const toCraft = Math.min(powderHeld, pearlsHeld);
if (toCraft > 0) {
  console.log(`Crafting ${toCraft} eye_of_ender...`);
  try {
    await lib.craft('eye_of_ender', toCraft);
    const totalEyes = lib.count('eye_of_ender');
    bot.chat(`Beta: 100% SUCCESS! Crafted ${totalEyes} EYES OF ENDER! Milestone 10 ready!`);
    console.log(`MILESTONE 10 READY: ${totalEyes} eye_of_ender crafted!`);
  } catch (ce) {
    console.log('Craft eye_of_ender error:', ce.message);
  }
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  eyes: lib.count('eye_of_ender'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
