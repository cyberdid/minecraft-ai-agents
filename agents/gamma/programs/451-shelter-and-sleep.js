// programs/451-shelter-and-sleep.js
console.log('=== GET TO SHELTER & SLEEP (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 3;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('gamma: Night is approaching! Sprinting to Base house (294, 72, -54)...');

// 1. Sprint directly to base door
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
} catch (e) {
  console.log('Path to door note:', e.message);
  await bot.lookAt(new Vec3(294, 72, -53), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
  await sleep(2500);
  bot.clearControlStates();
}

console.log('At base door! Pos:', lib.fmt(bot.entity.position));

// 2. Go through door into base house
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: Safely inside Base shelter!');

// 3. Set spawn and attempt sleep if night
try {
  await lib.setSpawn();
  console.log('Spawn set confirmed!');
} catch (e) {}

const t = lib.time();
console.log('Time of day:', bot.time.timeOfDay, 'phase:', t.phase, 'secondsUntilNight:', t.secondsUntilNight);

if (t.secondsUntilNight <= 5 || bot.time.timeOfDay >= 12541) {
  console.log('Attempting to sleep in base bed...');
  try {
    await lib.sleep();
    console.log('Slept successfully! Time is now day.');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// 4. Inspect base chest at (293, 72, -57)
try {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.items();
    console.log('Base chest contains:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name === 'shield' || it.name.includes('iron_') || it.name.includes('cooked_') || it.name.includes('bread')) {
        try { await chest.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    chest.close();
  }
} catch (e) {
  console.log('Chest access note:', e.message);
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
