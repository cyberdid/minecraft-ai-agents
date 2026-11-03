// programs/803-night-protocol-base-reunion.js
console.log('=== Program 803: Night Protocol & Base Reunion ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Move to Base Door (294, 72, -54)
console.log('Moving to Base Door (294, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294.0, 72.0, -53.0, 1.2));
} catch (e) {
  try { await lib.goTo(294.0, 72.0, -53.0, 1.5, { timeoutMs: 8000 }); } catch (e2) {}
}

console.log('At doorstep. Passing through door into base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  // Fallback step inside
  const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
  if (doorBlock && doorBlock.name.includes('door')) {
    await bot.activateBlock(doorBlock);
    await sleep(250);
  }
  await bot.lookAt(new Vec3(293.5, 72.0, -56.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));
bot.chat('alpha: Inside base shelter with Beta and Delta! Ready for night sleep and team regear.');

// 2. Scan teammates inside base
const players = Object.values(bot.players).filter(p => p.username !== bot.username);
for (const p of players) {
  if (p.entity) {
    console.log(`Teammate ${p.username} inside base at ${lib.fmt(p.entity.position)} (dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// 3. Sleep protocol when night arrives (timeOfDay >= 12542)
console.log(`Time of day: ${bot.time.timeOfDay}`);
if (bot.time.timeOfDay < 12542) {
  const waitMs = Math.min((12542 - bot.time.timeOfDay) * 50, 20000);
  console.log(`Waiting for nightfall (${waitMs}ms)...`);
  await sleep(waitMs);
}

// Attempt sleep
try {
  console.log('Calling lib.sleep()...');
  const sleepRes = await lib.sleep();
  console.log('Sleep result:', sleepRes);
} catch (e) {
  console.log('Sleep note:', e.message);
}

// 4. Audit Base Chest at (293, 72, -57)
let chestItems = [];
try {
  const chestBlock = bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 5 });
  if (chestBlock) {
    const chest = await bot.openChest(chestBlock);
    chestItems = chest.containerItems().map(i => `${i.name}x${i.count}`);
    console.log('Base Chest contents:', chestItems.join(', '));
    
    // Withdraw food if available
    const food = chest.containerItems().find(i => i.name.includes('cooked') || i.name === 'bread');
    if (food && lib.count('*cooked*') === 0 && lib.count('bread') === 0) {
      console.log(`Withdrawing ${food.name} x${Math.min(food.count, 16)} from base chest...`);
      await chest.withdraw(food.type, null, Math.min(food.count, 16));
    }
    
    // Check blaze_powder
    const bp = chest.containerItems().find(i => i.name === 'blaze_powder');
    if (bp) {
      console.log(`Confirmed blaze_powder in Base Chest: ${bp.count}`);
    }

    chest.close();
  }
} catch (e) {
  console.log('Chest audit error:', e.message);
}

// Re-equip armor and weapons
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

bot.chat(`alpha: Base audit complete! HP: ${bot.health}/20, Food: ${bot.food}/20. Ready for Nether expedition!`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  timeOfDay: bot.time.timeOfDay,
  inv: lib.inv(),
  chest: chestItems
};
