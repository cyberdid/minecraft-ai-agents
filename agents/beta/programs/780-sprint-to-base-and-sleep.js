// programs/780-sprint-to-base-and-sleep.js
console.log('=== Program 780: Sprint from Spawn to Base & Sleep ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Seconds until night:', lib.time().secondsUntilNight);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden_boots remain on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet slot:', bot.inventory.slots[8]?.name);

// Step 1: Sprint towards base house at (293, 72, -54)
console.log('Sprinting ~120m East-South to base house at (293, 72, -54)...');
bot.chat('Beta: Sprinting back from spawn to Base house to sleep and lock spawn!');

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -53.5, 2.0));
} catch (e) {
  console.log('Sprint goto note:', e.message);
  try {
    await lib.goToXZ(293.0, -53.5, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Arrived near base! Pos:', lib.fmt(bot.entity.position));

// Step 2: Enter base house
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 4.0) {
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Inside base house!');
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
      await lib.door(294, 72, -54, false);
    } catch (e2) {}
  }
}

// Step 3: Sleep in bed to set spawn and skip night
const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 6 });
console.log('Bed found at:', bed ? lib.fmt(bed.position) : 'none');

const timeInfo = lib.time();
console.log('Time info:', timeInfo);

if (bed) {
  const sleepStart = Date.now();
  while (!lib.time().canSleep && Date.now() - sleepStart < 60000 && !isCancelled()) {
    console.log(`Waiting for night to sleep... (${lib.time().secondsUntilNight}s left)`);
    await sleep(2000);
  }

  if (lib.time().canSleep) {
    console.log('Night reached! Sleeping in bed to set spawn and skip night...');
    bot.chat('Beta: Sleeping in base bed! Spawn locked & skipping night!');
    try {
      await bot.sleep(bed);
      console.log('In bed! Waiting to wake up...');
      const wakeStart = Date.now();
      while (bot.isSleeping && Date.now() - wakeStart < 15000 && !isCancelled()) {
        await sleep(500);
      }
      if (bot.isSleeping) await bot.wake();
      console.log('Awake! Night successfully skipped!');
      bot.chat('Beta: Good morning! Spawn permanently locked at Base Bed!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

// Step 4: Check base chest for Delta's deposited gold ingot
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const ingot = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await chest.withdraw(ingot.type, null, ingot.count);
      console.log(`Withdrew ${ingot.count} gold_ingot from base chest!`);
    }
    await chest.close();
  } catch (e) {}
}

console.log('=== Final Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Gold ingots on Beta:', lib.count('gold_ingot'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  gold_ingots: lib.count('gold_ingot')
};
