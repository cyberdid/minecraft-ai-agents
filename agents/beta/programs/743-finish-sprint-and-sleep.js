// programs/743-finish-sprint-and-sleep.js
console.log('=== Program 743: Finish Sprint, Lock Spawn & Sleep/Portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Overland checkpoints to Base (293, 72, -55)
const CHECKPOINTS = [
  { x: 200, z: -68 },
  { x: 250, z: -60 },
  { x: 285, z: -55 },
  { x: 293, z: -55 }
];

console.log('Sprinting overland to Base...');
for (let i = 0; i < CHECKPOINTS.length && !isCancelled(); i++) {
  const cp = CHECKPOINTS[i];
  try {
    await lib.goToXZ(cp.x, cp.z, { timeoutMs: 12000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalXZ(cp.x, cp.z)); } catch (e2) {}
  }
}

console.log('Arrived near Base entrance! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step cleanly inside base house at (293.5, 72.0, -55.5)
try {
  await lib.goTo(293.5, 72.0, -55.5, 0.5, { timeoutMs: 8000 });
} catch (e) {}

// Stand directly at Bed 1 (294, 72, -55)
const bedBlock = bot.blockAt(new Vec3(294, 72, -55));
console.log('Bed 1 block at (294, 72, -55):', bedBlock?.name);

if (bedBlock && bedBlock.name.includes('bed')) {
  await bot.lookAt(bedBlock.position.offset(0.5, 0.5, 0.5), true);
  try {
    await lib.setSpawn();
    bot.chat('Beta: Bed spawn point permanently locked at Base Bed (294, 72, -55)!');
    console.log('Spawn point locked successfully!');
  } catch (e) {
    try {
      await bot.activateBlock(bedBlock);
      bot.chat('Beta: Bed activated directly for spawn point!');
    } catch (e2) {}
  }

  // If night or dusk (time >= 12542), sleep!
  if (bot.time.timeOfDay >= 12540 || bot.time.timeOfDay < 23460 && bot.time.timeOfDay > 12540) {
    console.log('Night/dusk active, sleeping in bed...');
    try {
      await lib.sleep();
      bot.chat('Beta: Slept in bed! Woke up at dawn with full health & food!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

// Equip shield offhand, sword in hand
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// Enter Nether Portal
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
  bot.chat('Beta: Warped into Nether with full vitality & Shield! Heading to Spawner Pillbox!');
  console.log('In Nether! Pos:', lib.fmt(bot.entity.position));
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
