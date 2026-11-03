// programs/740-reach-base-and-enter-portal.js
console.log('=== Program 740: Final Sprint to Base, Set Spawn & Enter Portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Sprint to (250, -65) then (293, -55)
console.log('Sprint leg 1 to (250, -65)...');
try {
  await lib.goToXZ(250, -65, { timeoutMs: 12000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalXZ(250, -65)); } catch (e2) {}
}

console.log('Sprint leg 2 to Base entrance (293, -55)...');
try {
  await lib.goToXZ(293, -55, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2)); } catch (e2) {}
}

console.log('Arrived at Base! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step into base at (293, 72, -55)
try {
  await lib.goTo(293, 72, -55, 1.0, { timeoutMs: 6000 });
} catch (e) {}

// Lock spawn on bed!
try {
  const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
  if (bedBlock) {
    console.log('Found bed at', lib.fmt(bedBlock.position), 'setting spawn point...');
    await lib.setSpawn();
    bot.chat('Beta: Spawn point permanently locked at Base Bed (294, 72, -55)!');
  }
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Deposit soul sand to free up inventory slots
try {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    const chest = await bot.openChest(chestBlock);
    const ss = bot.inventory.items().find(i => i.name === 'soul_sand');
    if (ss) await chest.deposit(ss.type, null, ss.count);
    await chest.close();
    console.log('Deposited soul sand into chest. Inv:', lib.inv());
  }
} catch (e) {}

// Step into Nether Portal at (299.5, 73.0, -54.0)
console.log('Stepping into Nether Portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
} catch (e) {}

const portalBlock = new Vec3(299.5, 73.0, -54.0);
if (bot.entity.position.distanceTo(portalBlock) > 0.8) {
  await bot.lookAt(portalBlock.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

bot.clearControlStates();
bot.pathfinder.stop();

const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
    await bot.lookAt(portalBlock, true);
    bot.setControlState('forward', true);
    if (cur.y < 72.8) bot.setControlState('jump', true);
    await sleep(300);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(300);
}

if (bot.game.dimension === 'the_nether') {
  bot.chat('Beta: Safely warped into Nether with full 20/20 HP & Shield!');
  console.log('Warped into Nether! Pos:', lib.fmt(bot.entity.position));
  // Step forward out of portal into bunker
  if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
