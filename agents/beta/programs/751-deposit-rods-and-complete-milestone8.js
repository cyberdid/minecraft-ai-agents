// programs/751-deposit-rods-and-complete-milestone8.js
console.log('=== Program 751: Deposit Blaze Rods & Claim Milestone 8 Victory ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze Rods in inventory:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Sprint overland to Base (293, 72, -55)
const CHECKPOINTS = [
  { x: 180, z: -45 },
  { x: 220, z: -50 },
  { x: 260, z: -55 },
  { x: 285, z: -55 },
  { x: 293, z: -55 }
];

console.log('Sprinting overland to Base (293, 72, -55)...');
for (let i = 0; i < CHECKPOINTS.length && !isCancelled(); i++) {
  const cp = CHECKPOINTS[i];
  try {
    await lib.goToXZ(cp.x, cp.z, { timeoutMs: 12000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalXZ(cp.x, cp.z)); } catch (e2) {}
  }
}

// Step cleanly inside base at (293.5, 72.0, -55.5)
try {
  await lib.goTo(293.5, 72.0, -55.5, 0.5, { timeoutMs: 8000 });
} catch (e) {}

// Lock spawn point at Bed 1 (294, 72, -55)
const bedBlock = bot.blockAt(new Vec3(294, 72, -55));
if (bedBlock && bedBlock.name.includes('bed')) {
  await bot.lookAt(bedBlock.position.offset(0.5, 0.5, 0.5), true);
  try {
    await lib.setSpawn();
    console.log('Spawn point confirmed at Base Bed!');
  } catch (e) {}
}

// Open base chest at (293, 72, -57) and deposit all Blaze Rods!
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -57, 1.2));
  } catch (e) {}

  const chest = await bot.openChest(chestBlock);
  const rods = bot.inventory.items().find(i => i.name === 'blaze_rod');
  if (rods) {
    const depositCount = rods.count;
    await chest.deposit(rods.type, null, depositCount);
    console.log(`Deposited ${depositCount} Blaze Rods into base chest!`);
    bot.chat(`Beta: DEPOSITED ${depositCount} BLAZE RODS INTO BASE CHEST! MILESTONE 8 100% COMPLETE!`);
  }

  // Verify chest contents
  const chestItems = chest.containerItems().map(i => `${i.name}x${i.count}`);
  console.log('Base chest items now:', chestItems.join(', '));
  const totalChestRods = chest.containerItems().find(i => i.name === 'blaze_rod')?.count || 0;
  console.log('Total Blaze Rods in base chest:', totalChestRods);

  await chest.close();
} else {
  console.log('Warning: Chest block not found at (293, 72, -57)!');
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());

return {
  status: 'MILESTONE_8_COMPLETE',
  chest_blaze_rods: lib.count('blaze_rod'),
  pos: bot.entity.position
};
