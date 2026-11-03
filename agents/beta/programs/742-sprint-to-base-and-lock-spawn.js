// programs/742-sprint-to-base-and-lock-spawn.js
console.log('=== Program 742: Sprint to Base & Precision Spawn Lock ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Overland checkpoints to Base (293, 72, -55)
const CHECKPOINTS = [
  { x: 100, z: -100 },
  { x: 150, z: -80 },
  { x: 200, z: -65 },
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

// Stand directly at bed (294, 72, -55)
const bedBlock = bot.blockAt(new Vec3(294, 72, -55));
console.log('Bed 1 block at (294, 72, -55):', bedBlock?.name);

if (bedBlock && bedBlock.name.includes('bed')) {
  await bot.lookAt(bedBlock.position.offset(0.5, 0.5, 0.5), true);
  try {
    await lib.setSpawn();
    bot.chat('Beta: Bed spawn point permanently locked at Base Bed (294, 72, -55)!');
    console.log('Spawn point set successfully!');
  } catch (e) {
    console.log('setSpawn via lib failed, attempting direct bed activation:', e.message);
    try {
      await bot.activateBlock(bedBlock);
      bot.chat('Beta: Bed activated for spawn point!');
    } catch (e2) {
      console.log('Direct activation failed:', e2.message);
    }
  }
}

// Deposit soul sand or non-combat items
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(chestBlock);
    const ss = bot.inventory.items().find(i => i.name === 'soul_sand');
    if (ss) await chest.deposit(ss.type, null, ss.count);
    await chest.close();
    console.log('Deposited soul sand. Inv:', lib.inv());
  } catch (e) {}
}

// Ensure gear equipped
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Gear equipped! Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);
console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
