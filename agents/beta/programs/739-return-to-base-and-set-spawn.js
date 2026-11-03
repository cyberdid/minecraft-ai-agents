// programs/739-return-to-base-and-set-spawn.js
console.log('=== Program 739: Return to Base & Re-arm ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Overworld checkpoints from world spawn (61, 62, -78) to Base (293, 72, -55)
const CHECKPOINTS = [
  { x: 100, z: -75 },
  { x: 150, z: -70 },
  { x: 200, z: -65 },
  { x: 250, z: -60 },
  { x: 285, z: -55 },
  { x: 293, z: -55 }
];

console.log('Sprinting overland to Base (293, 72, -55)...');
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < CHECKPOINTS.length && !isCancelled(); i++) {
  const cp = CHECKPOINTS[i];
  console.log(`Heading to checkpoint ${i + 1}/${CHECKPOINTS.length}: (${cp.x}, ${cp.z})...`);
  try {
    await lib.goToXZ(cp.x, cp.z, { timeoutMs: 15000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalXZ(cp.x, cp.z));
    } catch (e2) {}
  }
}

console.log('Arrived near Base! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step into base at (293, 72, -55)
try {
  await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 8000 });
} catch (e) {}

// Find bed in base and lock spawn!
const bedBlock = bot.findBlock({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 6
});
if (bedBlock) {
  console.log('Found bed at', lib.fmt(bedBlock.position), 'setting spawn...');
  try {
    await lib.setSpawn();
    bot.chat('Beta: Spawn point permanently locked at Base Bed!');
    console.log('Spawn point set successfully!');
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }
} else {
  console.log('No bed within 6 blocks of base pos');
}

// Check base chest for any supplies
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
    await chest.close();
  } catch (e) {}
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food
};
